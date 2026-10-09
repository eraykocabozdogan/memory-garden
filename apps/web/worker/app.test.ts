import { expect, test } from "vitest";

import { app } from "./app";

const assets = {
  fetch: async (request: Request) => new Response(`shell:${new URL(request.url).pathname}`),
} as unknown as Fetcher;

const env = { ASSETS: assets } as Env;

test("the health endpoint answers", async () => {
  const response = await app.request("/api/health", {}, env);
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
});

test("unknown API routes return JSON 404s instead of the SPA shell", async () => {
  const response = await app.request("/api/unknown", {}, env);
  expect(response.status).toBe(404);
  await expect(response.json()).resolves.toEqual({ error: "Not found" });
});

test("app routes are answered with the SPA shell", async () => {
  const response = await app.request("/app/day/2026-10-09", {}, env);
  await expect(response.text()).resolves.toBe("shell:/__spa-fallback");
});
