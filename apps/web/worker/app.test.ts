import { expect, test } from "vitest";

import { app } from "./app";

const assets = {
  fetch: async (request: Request) => new Response(`shell:${new URL(request.url).pathname}`),
} as unknown as Fetcher;

const env = { ASSETS: assets } as unknown as Env;

test("the health endpoint answers", async () => {
  const response = await app.request("/api/health", {}, env);
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
});

test("API routes answer in JSON, never with the SPA shell", async () => {
  // Signed out, so the API refuses before it even looks for the route (G1).
  const response = await app.request("/api/unknown", {}, env);
  expect(response.status).toBe(401);
  await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
});

test("app routes are answered with the SPA shell", async () => {
  const response = await app.request("/app/day/2026-10-09", {}, env);
  await expect(response.text()).resolves.toBe("shell:/__spa-fallback");
});
