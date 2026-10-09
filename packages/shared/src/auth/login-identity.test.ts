import { expect, test } from "vitest";

import { normalizeLoginUsername } from "./login-identity";

test("trims usernames and keeps their case", () => {
  expect(normalizeLoginUsername("  uye-bir  ")).toBe("uye-bir");
  expect(normalizeLoginUsername("Uye-Bir")).toBe("Uye-Bir");
});

test("rejects empty, oversized and non-string usernames", () => {
  expect(normalizeLoginUsername("   ")).toBeNull();
  expect(normalizeLoginUsername("a".repeat(65))).toBeNull();
  expect(normalizeLoginUsername(undefined)).toBeNull();
});
