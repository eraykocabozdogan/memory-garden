import { Hono } from "hono";

export type AppEnv = { Bindings: Env };

// The prerendered "/" page owns index.html, so React Router writes the SPA shell to
// __spa-fallback.html. Static asset routing serves it without the extension.
const SPA_SHELL_PATH = "/__spa-fallback";

export const app = new Hono<AppEnv>()
  .get("/api/health", (c) => c.json({ ok: true }))
  .all("/api/*", (c) => c.json({ error: "Not found" }, 404))
  .get("*", (c) => {
    const shellUrl = new URL(SPA_SHELL_PATH, c.req.url);
    return c.env.ASSETS.fetch(new Request(shellUrl, { headers: c.req.raw.headers }));
  });

export type AppType = typeof app;
