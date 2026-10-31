import { Hono } from "hono";

import { createAuth } from "./auth";

type Member = { id: string; name: string; username: string | null };

export type AppEnv = { Bindings: Env; Variables: { member: Member } };

// The prerendered "/" page owns index.html, so React Router writes the SPA shell to
// __spa-fallback.html. Static asset routing serves it without the extension.
const SPA_SHELL_PATH = "/__spa-fallback";

// The only Better Auth endpoints the app uses (SPEC 3.1). Everything else it ships, such as
// sign-up, username lookups or profile updates, answers 404, so no plugin can quietly widen
// the surface (G1, G2). Passkeys join this list in stage 8.
export const AUTH_PATHS = new Set([
  "/api/auth/sign-in/username",
  "/api/auth/sign-out",
  "/api/auth/get-session",
  "/api/auth/change-password",
]);

const auth = (c: { env: Env; req: { url: string } }) =>
  createAuth(c.env, new URL(c.req.url).origin);

export const app = new Hono<AppEnv>()
  .get("/api/health", (c) => c.json({ ok: true }))
  .on(["GET", "POST"], "/api/auth/*", async (c) => {
    if (!AUTH_PATHS.has(c.req.path)) return c.json({ error: "Not found" }, 404);
    return auth(c).handler(c.req.raw);
  })
  // Everything else under /api needs a signed-in member (G1). New routes go below this line.
  .use("/api/*", async (c, next) => {
    const { headers, response: found } = await auth(c).api.getSession({
      headers: c.req.raw.headers,
      returnHeaders: true,
    });
    if (!found) return c.json({ error: "Unauthorized" }, 401);
    const { id, name, username } = found.user;
    c.set("member", { id, name, username: username ?? null });
    await next();
    // Using the app pushes the session's end out again; the refreshed cookie has to reach the
    // browser too, or it would still expire 90 days after sign-in (SPEC 3.1, sliding 90 days).
    for (const cookie of headers.getSetCookie()) c.res.headers.append("set-cookie", cookie);
  })
  .get("/api/me", (c) => c.json(c.get("member")))
  .all("/api/*", (c) => c.json({ error: "Not found" }, 404))
  .get("*", (c) => {
    const shellUrl = new URL(SPA_SHELL_PATH, c.req.url);
    return c.env.ASSETS.fetch(new Request(shellUrl, { headers: c.req.raw.headers }));
  });

export type AppType = typeof app;
