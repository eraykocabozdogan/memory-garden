import { expect, test } from "vitest";

import { accountInput, createAccountSql, resetPasswordSql } from "./accounts";

test("usernames follow the sign-in rules and are lower-cased", () => {
  expect(accountInput.parse({ username: " Uye_Bir ", name: "Üye" }).username).toBe("uye_bir");
  for (const bad of ["ab", "uye-bir", "üye", "a b", "x".repeat(31), "x'; DROP TABLE user;--"]) {
    expect(accountInput.safeParse({ username: bad, name: "Üye" }).success).toBe(false);
  }
});

test("a quote in the display name cannot break out of the SQL string", () => {
  const [userSql] = createAccountSql(
    { username: "uye_bir", name: "D'Ali'); DELETE FROM user;--" },
    "salt:hash",
    { user: "u1", account: "a1" },
    1,
  );
  expect(userSql).toContain("'D''Ali''); DELETE FROM user;--'");
});

test("a password reset refuses a username the rules would not allow", () => {
  expect(() => resetPasswordSql("x' OR '1'='1", "salt:hash", 1)).toThrow();
});
