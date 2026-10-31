// Opens a member account or resets its password (SPEC 3.1: the app has no sign-up).
//
//   pnpm account create <username> "<Görünen ad>" [--local]
//   pnpm account reset <username> [--local]
//
// Asks for the password without echoing it, hashes it the way Better Auth checks it, and runs
// the SQL on D1 through wrangler (remote by default, --local for `wrangler dev`).
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hashPassword } from "better-auth/crypto";

import { createAccountSql, passwordInput, resetPasswordSql } from "../worker/accounts.ts";

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const { stdin } = process;
    stdin.setRawMode?.(true);
    stdin.resume();
    let value = "";
    const onData = (chunk: Buffer) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\r" || char === "\n") {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          stdin.setRawMode?.(false);
          process.exit(130);
        }
        // Arrow keys and other escape sequences are not part of a password.
        if (char === "\u001b") continue;
        value = char === "\u007f" ? value.slice(0, -1) : value + char;
      }
    };
    stdin.on("data", onData);
  });
}

async function newPassword() {
  const first = passwordInput.safeParse(await ask("Şifre: "));
  if (!first.success) throw new Error(first.error.issues[0]?.message);
  if ((await ask("Şifre (tekrar): ")) !== first.data) throw new Error("Şifreler aynı değil");
  return hashPassword(first.data);
}

const args = process.argv.slice(2);
const local = args.includes("--local");
const [command, username, name] = args.filter((a) => a !== "--local");

let statements: string[];
const member = username?.trim().toLowerCase();
if (command === "create" && username && name) {
  statements = createAccountSql(
    { username, name },
    await newPassword(),
    { user: randomUUID(), account: randomUUID() },
    Date.now(),
  );
} else if (command === "reset" && username) {
  statements = resetPasswordSql(username, await newPassword(), Date.now());
} else {
  console.error(
    'Kullanım: pnpm account create <kullanıcı-adı> "<Görünen ad>" | reset <kullanıcı-adı> [--local]',
  );
  process.exit(1);
}

// The SQL holds a password hash, so it goes through a private temp file, never the command line.
const dir = mkdtempSync(join(tmpdir(), "memory-garden-account-"));
const file = join(dir, "account.sql");
try {
  writeFileSync(file, statements.join("\n"), { mode: 0o600 });
  execFileSync(
    "pnpm",
    [
      "--filter",
      "@memory-garden/web",
      "exec",
      "wrangler",
      "d1",
      "execute",
      "DB",
      local ? "--local" : "--remote",
      `--file=${file}`,
    ],
    { stdio: "inherit" },
  );
  console.log(
    command === "create"
      ? `Hesap açıldı: ${member}`
      : `Şifre değişti, oturumlar kapandı: ${member}`,
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
