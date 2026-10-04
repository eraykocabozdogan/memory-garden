import { expect, test } from "@playwright/test";

test("signed-out visitors see the public flower guide", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Çiçeklerin sakladığı sözler" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Giriş" })).toBeVisible();
});

test("signed-out visitors keep visitor controls on the flowers route", async ({ page }) => {
  await page.goto("/flowers");

  await expect(page.getByRole("link", { name: "Giriş" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Anılara dön" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Çıkış" })).toHaveCount(0);
});

test("signed-out visitors are redirected from the private diary", async ({ page }) => {
  await page.goto("/diary");
  await expect(page).toHaveURL(/\/login$/);
});

test("login has no registration path", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Hoş geldin." })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Kullanıcı adı" })).toHaveAttribute(
    "autocomplete",
    "username",
  );
  await expect(page.getByText("Yeni hesap oluşturulamaz.")).toBeVisible();
  await expect(page.getByRole("link", { name: /kayıt|register/i })).toHaveCount(0);
});

test("login rejects an unknown username without exposing internal identities", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("textbox", { name: "Kullanıcı adı" }).fill("bilinmeyen");
  await page.getByLabel("Şifre").fill("gecersiz-parola");
  await page.getByRole("button", { name: "İçeri gir" }).click();

  const loginError = page.getByRole("alert").filter({ hasText: "Kullanıcı adı veya şifre" });
  await expect(loginError).toHaveText("Kullanıcı adı veya şifre hatalı.");
  await expect(loginError).not.toContainText("example.com");
});

test("protected memories route redirects to login without a session", async ({ page }) => {
  await page.goto("/memories");

  await expect(page).toHaveURL(/\/login$/);
});

test("private memory APIs reject requests without a session", async ({ request }) => {
  const responses = [
    await request.post("/api/memories", { data: {} }),
    await request.patch("/api/memories/00000000-0000-0000-0000-000000000000", {
      data: {},
    }),
    await request.patch("/api/memory-days/2026-05-15/locations", { data: {} }),
    await request.delete("/api/memories/00000000-0000-0000-0000-000000000000"),
    await request.post("/api/uploads/initialize", { data: {} }),
    await request.get("/api/media/00000000-0000-0000-0000-000000000000"),
    await request.post("/api/media/00000000-0000-0000-0000-000000000000/retry"),
    await request.post("/api/internal/media-processing/config"),
    await request.post("/api/internal/media-processing/multipart", { data: {} }),
    await request.post("/api/internal/media-processing/callback", { data: {} }),
    await request.post("/api/diary", { data: {} }),
    await request.patch("/api/diary/00000000-0000-0000-0000-000000000000", {
      data: {},
    }),
    await request.delete("/api/diary/00000000-0000-0000-0000-000000000000"),
    await request.put(
      "/api/diary/00000000-0000-0000-0000-000000000000/flower",
      { data: {} },
    ),
  ];

  expect(responses.map((response) => response.status())).toEqual([
    401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401, 401,
  ]);
});
