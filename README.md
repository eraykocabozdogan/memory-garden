# Memory Garden

A private memory and diary app for two people, and a public guide to the language of flowers
built on historical sources (Ingram 1869, Phillips 1825, Tyas 1869) and the plates of Curtis's
Botanical Magazine. Runs entirely on Cloudflare.

> **Status:** being rewritten from scratch on Cloudflare. The previous Next.js + Supabase + Vercel
> version is tagged `v0-nextjs`.

## Documentation (Turkish)

- [`docs/decisions.md`](docs/decisions.md): every product and technical decision, the options
  considered and the reasoning
- [`docs/architecture.md`](docs/architecture.md): the system design
- [`docs/handoff.md`](docs/handoff.md): current status and next steps

## Stack

Cloudflare Workers, React Router (SPA + prerendered public pages), Hono, D1 + Drizzle,
Better Auth, R2, Queues, Cloudflare Images, Containers (ffmpeg), Durable Objects, pnpm monorepo,
Biome, Vitest, Playwright.

## Repository layout

| Path | Contents |
|---|---|
| `apps/web` | React Router app and the Hono API Worker (`memory-garden`, `memory-garden-demo`) |
| `apps/media` | Media processing Worker and the ffmpeg container (`memory-garden-media`) |
| `packages/shared` | Shared domain logic, flower catalog, Turkish locations |
| `research` | The flower-language source study and visual source comparison |
| `scripts` | Data generation scripts |

## Development

Requires Node 22.22+ and pnpm 10.

```bash
pnpm install
pnpm dev          # app on http://localhost:5173, API Worker on :8787
pnpm check        # Biome
pnpm typecheck
pnpm test         # unit tests
pnpm test:e2e     # Playwright against a production build served by Wrangler
```
