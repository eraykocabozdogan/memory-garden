// Prepares the local D1 that `wrangler dev` uses in the browser tests: applies the migrations,
// clears earlier runs (rate-limit counters included) and opens one test account. Local only:
// it empties the local database, so whatever `wrangler dev` held locally is gone after e2e.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hashPassword } from "better-auth/crypto";
import { E2E_MEMBER } from "../e2e/member.ts";
import { createAccountSql } from "../worker/accounts.ts";

const wrangler = (...args: string[]) =>
  execFileSync("pnpm", ["exec", "wrangler", ...args], { stdio: "inherit" });

wrangler("d1", "migrations", "apply", "DB", "--local");

const now = Date.now();
const statements = [
  "DELETE FROM session;",
  "DELETE FROM account;",
  "DELETE FROM rateLimit;",
  "DELETE FROM user;",
  ...createAccountSql(
    { username: E2E_MEMBER.username, name: E2E_MEMBER.name },
    await hashPassword(E2E_MEMBER.password),
    { user: "e2e-user", account: "e2e-account" },
    now,
  ),
];

const dir = mkdtempSync(join(tmpdir(), "memory-garden-e2e-"));
try {
  const file = join(dir, "seed.sql");
  writeFileSync(file, statements.join("\n"));
  wrangler("d1", "execute", "DB", "--local", `--file=${file}`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
