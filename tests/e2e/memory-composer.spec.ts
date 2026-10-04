import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/prototype");
  await page.getByRole("button", { name: "Anı ekle" }).click();
});

test("keeps mixed files and multiple texts in one reorderable package", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles([
    { name: "bahar.jpg", mimeType: "image/jpeg", buffer: Buffer.from("photo") },
    { name: "yol.mp4", mimeType: "video/mp4", buffer: Buffer.from("video") },
  ]);
  await page.getByRole("button", { name: "Metin ekle" }).click();
  await page.getByRole("button", { name: "Metin ekle" }).click();

  const list = page.getByRole("list", { name: "Anı paketinin parçaları" });
  await expect(list.getByRole("listitem")).toHaveCount(4);
  await expect(list).toContainText("bahar.jpg");
  await expect(list).toContainText("yol.mp4");

  await list.getByRole("textbox", { name: "Metin" }).nth(0).fill("İlk not");
  await list.getByRole("textbox", { name: "Metin" }).nth(1).fill("İkinci not");
  await page.getByRole("button", { name: "4. parçayı yukarı taşı" }).click();
  await page.getByRole("button", { name: "4. parçayı kaldır" }).click();

  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(list).toContainText("bahar.jpg");
  await expect(list).toContainText("yol.mp4");
  await expect(list).toContainText("İkinci not");
});

test("uploads at most two media files concurrently and submits one items array", async ({ page }) => {
  let initialization = 0;
  let activeUploads = 0;
  let maximumActiveUploads = 0;
  let submittedBody: Record<string, unknown> | undefined;

  await page.route("**/api/uploads/initialize", async (route) => {
    initialization += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mode: "single",
        uploadUrl: `https://upload.test/${initialization}`,
        uploadToken: `token-${initialization}`,
      }),
    });
  });
  await page.route("https://upload.test/**", async (route) => {
    activeUploads += 1;
    maximumActiveUploads = Math.max(maximumActiveUploads, activeUploads);
    await new Promise((resolve) => setTimeout(resolve, 80));
    activeUploads -= 1;
    await route.fulfill({ status: 200 });
  });
  await page.route("**/api/memories", async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ items: [] }),
    });
  });

  await page.locator('input[type="file"]').setInputFiles([
    { name: "bir.jpg", mimeType: "image/jpeg", buffer: Buffer.from("one") },
    { name: "iki.mp4", mimeType: "video/mp4", buffer: Buffer.from("two") },
    { name: "uc.png", mimeType: "image/png", buffer: Buffer.from("three") },
  ]);
  await page.getByRole("button", { name: "Metin ekle" }).click();
  await page.getByRole("textbox", { name: "Metin" }).fill("Aynı pakette bir not");
  await page.getByLabel("Ortak tarih bilgisi").selectOption("year");
  await page.getByRole("dialog", { name: "Birlikte ekle" }).getByRole("textbox", { name: "Yıl" }).fill("2024");
  await page.getByRole("button", { name: "Anıları kaydet" }).click();
  await expect(page.getByRole("dialog", { name: "Birlikte ekle" })).toHaveCount(0);

  expect(maximumActiveUploads).toBe(2);
  expect(submittedBody?.datePrecision).toBe("year");
  expect(submittedBody?.date).toBe("2024");
  expect(submittedBody?.items).toEqual([
    { kind: "photo", uploadToken: "token-1" },
    { kind: "video", uploadToken: "token-2" },
    { kind: "photo", uploadToken: "token-3" },
    { kind: "text", textContent: "Aynı pakette bir not" },
  ]);
});

test("discards successful raw uploads when a failed package is abandoned", async ({ page }) => {
  const discardedTokens: string[] = [];

  await page.route("**/api/uploads/initialize", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mode: "single",
        uploadUrl: "https://upload.test/raw",
        uploadToken: "temporary-token",
      }),
    });
  });
  await page.route("https://upload.test/**", (route) => route.fulfill({ status: 200 }));
  await page.route("**/api/memories", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Paket kaydedilemedi." }),
    }),
  );
  await page.route("**/api/uploads/abort", async (route) => {
    const body = route.request().postDataJSON() as { uploadToken: string };
    discardedTokens.push(body.uploadToken);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ discarded: true }),
    });
  });

  await page.locator('input[type="file"]').setInputFiles({
    name: "gecici.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("temporary"),
  });
  await page.getByRole("button", { name: "Anıları kaydet" }).click();
  await expect(page.getByRole("alert")).toHaveText("Paket kaydedilemedi.");
  await page.getByRole("button", { name: "Vazgeç" }).click();

  await expect.poll(() => discardedTokens).toEqual(["temporary-token"]);
});
