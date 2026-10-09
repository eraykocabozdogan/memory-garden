import { expect, test } from "vitest";

import { createSignedToken, type ExpiringPayload, verifySignedToken } from "./signed-token";

type TestPayload = ExpiringPayload & { itemId: string };

const secret = "test-secret";
const now = Date.UTC(2026, 9, 9, 12);

function isTestPayload(value: unknown): value is TestPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<TestPayload>;
  return typeof payload.expiresAt === "number" && typeof payload.itemId === "string";
}

test("a signed token round-trips its payload", async () => {
  const token = await createSignedToken({ expiresAt: now + 1000, itemId: "item-1" }, secret);
  await expect(verifySignedToken(token, secret, isTestPayload, now)).resolves.toEqual({
    expiresAt: now + 1000,
    itemId: "item-1",
  });
});

test("expired, tampered, foreign and malformed tokens are rejected", async () => {
  const expired = await createSignedToken({ expiresAt: now, itemId: "item-1" }, secret);
  await expect(verifySignedToken(expired, secret, isTestPayload, now)).resolves.toBeNull();

  const token = await createSignedToken({ expiresAt: now + 1000, itemId: "item-1" }, secret);
  const [, signature] = token.split(".");
  const forgedPayload = btoa(
    JSON.stringify({ expiresAt: now + 1000, itemId: "item-2" }),
  ).replaceAll("=", "");
  await expect(
    verifySignedToken(`${forgedPayload}.${signature}`, secret, isTestPayload, now),
  ).resolves.toBeNull();

  await expect(verifySignedToken(token, "other-secret", isTestPayload, now)).resolves.toBeNull();
  await expect(verifySignedToken(`${token}.extra`, secret, isTestPayload, now)).resolves.toBeNull();
  await expect(verifySignedToken("not-a-token", secret, isTestPayload, now)).resolves.toBeNull();
});

test("payloads that fail the shape check are rejected", async () => {
  const token = await createSignedToken({ expiresAt: now + 1000 }, secret);
  await expect(verifySignedToken(token, secret, isTestPayload, now)).resolves.toBeNull();
});
