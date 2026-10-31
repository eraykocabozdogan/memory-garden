// Bindings and secrets the API needs before they exist in wrangler.jsonc. The D1 database is
// created in stage 1 once the owner approves; then `pnpm typegen` lists DB itself and this file
// keeps only the secret. Set BETTER_AUTH_SECRET with `wrangler secret put`, locally in .dev.vars.
interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
}
