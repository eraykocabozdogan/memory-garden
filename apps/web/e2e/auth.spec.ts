import { expect, type Page, test } from "@playwright/test";

import { E2E_MEMBER } from "./member";

// Sign-ins per IP are limited (G3); these tests make four across both projects, under the cap.

test.beforeEach(async ({ page }) => {
  // The silk background is a full-screen shader; keep it to one frame in the browser tests.
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function fillSignIn(page: Page, password: string) {
  await page.getByLabel("Kullanıcı adı").fill(E2E_MEMBER.username);
  await page.getByLabel("Şifre").fill(password);
  await page.getByRole("button", { name: "Giriş yap" }).click();
}

test("signed out, the app sends the visitor to the sign-in screen", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/giris$/);
  await expect(page.getByRole("button", { name: "Giriş yap" })).toBeVisible();
});

test("a wrong password shows a message and stays on the sign-in screen", async ({ page }) => {
  await page.goto("/giris");
  await fillSignIn(page, "yanlis-sifre-000");
  await expect(page.getByRole("alert")).toHaveText("Kullanıcı adı ya da şifre yanlış.");
  await expect(page).toHaveURL(/\/giris$/);
});

test("signing in opens the app, signing out closes it", async ({ page }) => {
  await page.goto("/giris");
  await fillSignIn(page, E2E_MEMBER.password);
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByTestId("greeting")).toHaveText(`Merhaba, ${E2E_MEMBER.name}`);

  // Coming back to the sign-in screen while signed in goes straight to the app.
  await page.goto("/giris");
  await expect(page).toHaveURL(/\/app$/);

  await page.getByRole("button", { name: "Çıkış yap" }).click();
  await expect(page).toHaveURL(/\/giris$/);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/giris$/);
});
