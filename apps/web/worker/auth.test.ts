import { readdirSync, readFileSync } from "node:fs";
import { hashPassword } from "better-auth/crypto";
import { afterAll, beforeEach, expect, test } from "vitest";
import { getPlatformProxy } from "wrangler";

import { createAccountSql, resetPasswordSql } from "./accounts";
import { AUTH_PATHS, app } from "./app";
import { createAuth, SIGN_IN_LIMIT } from "./auth";

// Runs the real Worker app against a local D1 (Miniflare), with the real migrations.

const proxy = await getPlatformProxy<Env>({
  configPath: "wrangler.test.jsonc",
  persist: false,
});
afterAll(() => proxy.dispose());

const assets = { fetch: async () => new Response("shell") } as unknown as Fetcher;
const db = proxy.env.DB as D1Database;
const env = {
  ...proxy.env,
  DB: db,
  ASSETS: assets,
  BETTER_AUTH_SECRET: "test-secret-that-is-long-enough-for-better-auth",
} as Env;

const PASSWORD = "dogru-sifre-123";
let ip = 0;

async function run(statements: string[]) {
  for (const sql of statements) await db.prepare(sql).run();
}

beforeEach(async () => {
  const tables = ["session", "account", "verification", "rateLimit", "user"];
  const existing = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  if (existing.results.length === 0) {
    for (const file of readdirSync("migrations")
      .filter((f) => f.endsWith(".sql"))
      .sort()) {
      const sql = readFileSync(`migrations/${file}`, "utf8");
      await run(sql.split("--> statement-breakpoint").filter((s) => s.trim()));
    }
  }
  await run(tables.map((t) => `DELETE FROM "${t}";`));
  await run(
    createAccountSql(
      { username: "uye_bir", name: "Üye Bir" },
      await hashPassword(PASSWORD),
      { user: "u1", account: "a1" },
      Date.now(),
    ),
  );
  ip += 1; // a fresh address per test, so the sign-in limit of one test never leaks into another
});

function call(path: string, init: RequestInit & { ip?: string } = {}) {
  const headers = new Headers(init.headers);
  headers.set("cf-connecting-ip", init.ip ?? `203.0.113.${ip}`);
  headers.set("origin", "https://memory-garden.test");
  return app.request(`https://memory-garden.test${path}`, { ...init, headers }, env);
}

function signIn(password: string, address?: string) {
  return call("/api/auth/sign-in/username", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "uye_bir", password }),
    ip: address,
  });
}

function cookieOf(response: Response) {
  return response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

test("G1: without a session the API refuses, with one it answers", async () => {
  for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
    expect((await call("/api/me", { method })).status, method).toBe(401);
    expect((await call("/api/anything-else", { method })).status, method).toBe(401);
  }

  const signedIn = await signIn(PASSWORD);
  expect(signedIn.status).toBe(200);
  const me = await call("/api/me", { headers: { cookie: cookieOf(signedIn) } });
  expect(me.status).toBe(200);
  await expect(me.json()).resolves.toMatchObject({
    id: "u1",
    name: "Üye Bir",
    username: "uye_bir",
  });
});

test("G1: a wrong password or a forged cookie gets no session", async () => {
  expect((await signIn("yanlis-sifre-000")).status).toBe(401);
  const forged = "__Secure-better-auth.session_token=u1.forged";
  expect((await call("/api/me", { headers: { cookie: forged } })).status).toBe(401);
});

const sessionCookie = (response: Response) =>
  response.headers.getSetCookie().find((c) => c.includes("session_token"));
const maxAgeOf = (cookie?: string) => Number(cookie?.match(/Max-Age=(\d+)/i)?.[1]);
const NINETY_DAYS = 90 * 24 * 60 * 60;

test("G1: the session cookie is httpOnly, secure, same-site and lasts 90 days", async () => {
  const cookie = sessionCookie(await signIn(PASSWORD));
  expect(cookie).toMatch(/HttpOnly/i);
  expect(cookie).toMatch(/Secure/i);
  expect(cookie).toMatch(/SameSite=Lax/i);
  expect(maxAgeOf(cookie)).toBe(NINETY_DAYS);
});

test("using the app slides the session: the browser gets a fresh 90-day cookie", async () => {
  const signedIn = await signIn(PASSWORD);
  const before = await db.prepare("SELECT expiresAt FROM session").first<{
    expiresAt: number;
  }>();
  await new Promise((resolve) => setTimeout(resolve, 20));

  const me = await call("/api/me", { headers: { cookie: cookieOf(signedIn) } });
  expect(me.status).toBe(200);
  expect(maxAgeOf(sessionCookie(me))).toBe(NINETY_DAYS);
  const after = await db.prepare("SELECT expiresAt FROM session").first<{
    expiresAt: number;
  }>();
  expect(after?.expiresAt).toBeGreaterThan(before?.expiresAt ?? Number.POSITIVE_INFINITY);
});

test("G1, G2: only the sign-in endpoints the app uses are open", async () => {
  const closed = [
    "/api/auth/sign-up/email",
    "/api/auth/sign-up/username",
    "/api/auth/is-username-available",
    "/api/auth/update-user",
    "/api/auth/delete-user",
    "/api/auth/request-password-reset",
    "/api/auth/list-sessions",
  ];
  for (const path of closed) {
    const response = await call(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "uye_bir", email: "x@example.com", name: "X" }),
    });
    expect(response.status, path).toBe(404);
  }
  // The open ones reach Better Auth: whatever it answers, it is not the gate's own 404.
  for (const path of AUTH_PATHS) {
    await expect((await call(path, { method: "POST" })).text(), path).resolves.not.toBe(
      JSON.stringify({ error: "Not found" }),
    );
  }
});

test("G2: there is no way to open an account from the app", async () => {
  const response = await call("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "x@example.com",
      password: "uzun-bir-sifre-1",
      name: "X",
      username: "yeni",
    }),
  });
  expect(response.status).toBe(404);
  const users = await db.prepare("SELECT count(*) AS n FROM user").first<{ n: number }>();
  expect(users?.n).toBe(1);
});

test("G2: a reset password works and ends the member's sessions", async () => {
  const before = await signIn(PASSWORD);
  await run(resetPasswordSql("uye_bir", await hashPassword("yeni-sifre-456"), Date.now()));

  expect((await call("/api/me", { headers: { cookie: cookieOf(before) } })).status).toBe(401);
  expect((await signIn(PASSWORD)).status).toBe(401);
  expect((await signIn("yeni-sifre-456")).status).toBe(200);
});

test("G3: repeated sign-ins from one IP hit the limit, another IP is not affected", async () => {
  for (let i = 0; i < SIGN_IN_LIMIT.max; i++) {
    expect((await signIn("yanlis-sifre-000")).status).toBe(401);
  }
  expect((await signIn("yanlis-sifre-000")).status).toBe(429);
  // Even the right password waits until the window passes.
  expect((await signIn(PASSWORD)).status).toBe(429);

  expect((await signIn(PASSWORD, "198.51.100.7")).status).toBe(200);
});

test("G3: a client cannot dodge the limit by sending its own forwarding header", async () => {
  for (let i = 0; i <= SIGN_IN_LIMIT.max; i++) {
    const response = await call("/api/auth/sign-in/username", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `192.0.2.${i}` },
      body: JSON.stringify({ username: "uye_bir", password: "yanlis-sifre-000" }),
    });
    expect(response.status).toBe(i < SIGN_IN_LIMIT.max ? 401 : 429);
  }
});

test("G2: resetting an unknown username fails instead of reporting success", async () => {
  await expect(run(resetPasswordSql("yok_boyle", "salt:hash", Date.now()))).rejects.toThrow();
});

test("without a real secret the app refuses to sign anything", () => {
  expect(() => createAuth({ ...env, BETTER_AUTH_SECRET: "" }, "https://x.test")).toThrow();
  expect(() => createAuth({ ...env, BETTER_AUTH_SECRET: "short" }, "https://x.test")).toThrow();
});
