import { expect, test } from "@playwright/test";

import { resolveLoginEmail } from "../../features/auth/login-identity";

test("resolves the two approved usernames to their internal auth identities", () => {
  expect(resolveLoginEmail("uye-bir")).toBe("member-one@example.com");
  expect(resolveLoginEmail("uye-iki")).toBe("member-two@example.com");
});

test("trims input but rejects unknown and differently cased usernames", () => {
  expect(resolveLoginEmail("  uye-bir  ")).toBe("member-one@example.com");
  expect(resolveLoginEmail("Uye-bir")).toBeNull();
  expect(resolveLoginEmail("bilinmeyen")).toBeNull();
  expect(resolveLoginEmail(undefined)).toBeNull();
});
