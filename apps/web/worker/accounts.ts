import { z } from "zod";

// Accounts are opened and their passwords reset only from the command line (SPEC 3.1, G2).
// This module turns a validated request into SQL; scripts/account.ts hashes the password and
// hands the SQL to wrangler. Kept pure so the rules are testable without a database.

export const accountInput = z.object({
  // Matches Better Auth's username plugin: lower-cased, 3–30 of letters, digits, dot, underscore.
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._]{3,30}$/, "3–30 karakter: küçük harf, rakam, nokta, alt çizgi"),
  name: z.string().trim().min(1).max(64),
});

export const passwordInput = z.string().min(10, "Şifre en az 10 karakter").max(128);

export type AccountInput = z.infer<typeof accountInput>;

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

/** The reserved .invalid domain: Better Auth needs an email, and nothing here sends mail. */
export const placeholderEmail = (username: string) => `${username}@memory-garden.invalid`;

export function createAccountSql(
  input: AccountInput,
  passwordHash: string,
  ids: { user: string; account: string },
  now: number,
) {
  const { username, name } = accountInput.parse(input);
  return [
    `INSERT INTO user (id, name, email, emailVerified, username, displayUsername, createdAt, updatedAt) VALUES (${quote(ids.user)}, ${quote(name)}, ${quote(placeholderEmail(username))}, 0, ${quote(username)}, ${quote(username)}, ${now}, ${now});`,
    `INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt) VALUES (${quote(ids.account)}, ${quote(ids.user)}, 'credential', ${quote(ids.user)}, ${quote(passwordHash)}, ${now}, ${now});`,
  ];
}

/**
 * A new password also signs the member out everywhere, so a leaked session dies with it. An
 * unknown username fails the whole file instead of
 * quietly changing nothing while the script reports success.
 */
export function resetPasswordSql(username: string, passwordHash: string, now: number) {
  const { username: clean } = accountInput.pick({ username: true }).parse({ username });
  const userId = `(SELECT id FROM user WHERE username = ${quote(clean)})`;
  return [
    // json() of a non-JSON string raises an error, which stops the file before anything runs.
    `SELECT json(CASE WHEN ${userId} IS NULL THEN 'unknown username' ELSE '1' END);`,
    `UPDATE account SET password = ${quote(passwordHash)}, updatedAt = ${now} WHERE providerId = 'credential' AND userId = ${userId};`,
    `DELETE FROM session WHERE userId = ${userId};`,
  ];
}
