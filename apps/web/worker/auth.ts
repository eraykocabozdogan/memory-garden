import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";

import { PASSWORD_LENGTH } from "./accounts";
import * as schema from "./db/schema";

const DAY = 60 * 60 * 24;

/** Sign-in attempts, right or wrong, one IP may make per window before it is turned away (G3). */
export const SIGN_IN_LIMIT = { window: 15 * 60, max: 5 };

export function createAuth(env: Env, baseURL: string) {
  // The demo Worker has no DB binding on purpose (G4); it gets its own sign-in in stage 9.
  if (!env.DB) throw new Error("DB binding is missing");
  // Never fall back to a library default: a guessable secret would let anyone forge sessions.
  if ((env.BETTER_AUTH_SECRET ?? "").length < 32) throw new Error("BETTER_AUTH_SECRET is missing");
  return betterAuth({
    baseURL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(drizzle(env.DB, { schema }), { provider: "sqlite", schema }),
    // Accounts are opened only by scripts/account.ts (G2); there is no sign-up in the app.
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: PASSWORD_LENGTH.min,
      maxPasswordLength: PASSWORD_LENGTH.max,
    },
    plugins: [username()],
    // Sliding 90 days: every use pushes the end out again (SPEC 3.1).
    session: { expiresIn: 90 * DAY, updateAge: 0 },
    rateLimit: {
      // Off outside production by default, and a Worker has no NODE_ENV; turn it on outright.
      enabled: true,
      // Kept in D1, so it holds across Worker instances and needs no platform-only service.
      storage: "database",
      customRules: { "/sign-in/*": SIGN_IN_LIMIT },
    },
    advanced: {
      // Cloudflare puts the visitor's address here; other headers can be forged by the client.
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
      defaultCookieAttributes: { httpOnly: true, secure: true, sameSite: "lax" },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
