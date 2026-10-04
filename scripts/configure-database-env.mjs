import { chmod, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [projectRef, region] = process.argv.slice(2);
if (!projectRef || !region) {
  throw new Error("Usage: node scripts/configure-database-env.mjs <project-ref> <region>");
}
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  throw new Error("This setup must run in an interactive terminal.");
}

function readHidden(prompt) {
  return new Promise((resolvePassword, reject) => {
    let password = "";
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    function finish(error) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.off("data", onData);
      process.stdout.write("\n");
      if (error) reject(error);
      else resolvePassword(password);
    }

    function onData(character) {
      if (character === "\u0003") return finish(new Error("Setup cancelled."));
      if (character === "\r" || character === "\n") return finish();
      if (character === "\u007f") {
        password = password.slice(0, -1);
        return;
      }
      password += character;
    }

    process.stdin.on("data", onData);
  });
}

function setEnvironmentValue(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(contents)) return contents.replace(pattern, line);
  return `${contents.trimEnd()}\n${line}\n`;
}

const password = await readHidden("Supabase database password (input is hidden): ");
if (!password) throw new Error("Database password cannot be empty.");

const encodedPassword = encodeURIComponent(password);
const baseUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-${region}.pooler.supabase.com`;
const envPath = resolve(process.cwd(), ".env.local");
let contents = await readFile(envPath, "utf8");
contents = setEnvironmentValue(
  contents,
  "DATABASE_URL",
  `${baseUrl}:6543/postgres?sslmode=require`,
);
contents = setEnvironmentValue(
  contents,
  "DATABASE_MIGRATION_URL",
  `${baseUrl}:5432/postgres?sslmode=require`,
);

await writeFile(envPath, contents, { encoding: "utf8", mode: 0o600 });
await chmod(envPath, 0o600);
process.stdout.write("Database connection values saved to .env.local.\n");
