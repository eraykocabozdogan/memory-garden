// Secrets are not listed in wrangler.jsonc, so `wrangler types` cannot see them. Set with
// `wrangler secret put BETTER_AUTH_SECRET`; locally in .dev.vars.
interface Env {
  BETTER_AUTH_SECRET: string;
}
