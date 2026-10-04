import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/prototype");
});

test("month scope includes day, month, and overlapping year items", async ({ page }) => {
  await expect(page.getByTestId("date-label")).toContainText("Mayıs 2026");
  await expect(page.getByTestId("month-grid").locator(".memory-tile")).toHaveCount(9);
  await expect(page.getByTestId("memory-year-letter")).toBeVisible();
  await expect(page.getByTestId("memory-undated-keepsake")).toHaveCount(0);

  await page.getByRole("button", { name: "Sonraki ay" }).click();
  await expect(page.getByTestId("date-label")).toContainText("Haziran 2026");
  await expect(page.getByTestId("month-grid").locator(".memory-tile")).toHaveCount(1);
  await expect(page.getByTestId("memory-year-letter")).toBeVisible();
});

test("an exact-day item opens the single daily entry with every piece", async ({ page }) => {
  await page.getByTestId("memory-urla-road").click();

  const viewer = page.getByRole("dialog", { name: "Urla yolu" });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByTestId("media-viewer-image")).toBeVisible();
  await viewer.getByRole("button", { name: "Güne git" }).click();

  await expect(page.getByTestId("day-entry")).toBeVisible();
  await expect(page.getByTestId("date-label")).toContainText("15 Mayıs 2026");
  await expect(page.getByTestId("day-entry").locator(".day-piece")).toHaveCount(3);
  await expect(page.getByRole("list", { name: "Günün konum rotası" }).getByRole("listitem")).toHaveCount(3);
});

test("month-only video opens in the media viewer and closes with Escape", async ({ page }) => {
  await page.getByRole("button", { name: "Önceki ay" }).click();
  await page.getByTestId("memory-spring-hands").click();

  const viewer = page.getByRole("dialog", { name: "Nisan'dan kısa bir kayıt" });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByTestId("media-viewer-video")).toBeVisible();
  await expect(viewer.getByTestId("media-viewer-video")).toHaveAttribute(
    "src",
    "/prototype-video.mp4",
  );
  await expect(viewer.getByRole("button", { name: "Güne git" })).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);
});

test("media deletion requires confirmation and removes the item after success", async ({ page }) => {
  await page.route("**/api/memories/urla-road", async (route) => {
    expect(route.request().method()).toBe("DELETE");
    await route.fulfill({ status: 204 });
  });

  await page.getByTestId("memory-urla-road").click();
  const viewer = page.getByRole("dialog", { name: "Urla yolu" });
  await viewer.getByRole("button", { name: "Anıyı sil" }).click();

  const confirmation = page.getByRole("alertdialog", { name: "Bu anı silinsin mi?" });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: "Kalıcı olarak sil" }).click();
  await expect(confirmation).toHaveCount(0);
  await expect(page.getByTestId("memory-urla-road")).toHaveCount(0);

  await page.getByRole("button", { name: "Sonraki ay" }).click();
  await expect(page.getByTestId("date-label")).toContainText("Haziran 2026");
});

test("media viewer edits an item without exposing or changing the destination route", async ({ page }) => {
  let submittedBody: Record<string, unknown> | undefined;
  await page.route("**/api/memories/urla-road", async (route) => {
    expect(route.request().method()).toBe("PATCH");
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 204 });
  });

  await page.getByTestId("memory-urla-road").click();
  await page.getByRole("dialog", { name: "Urla yolu" }).getByRole("button", {
    name: "Anıyı düzenle",
  }).click();

  const editor = page.getByRole("dialog", { name: "Anıyı düzenle" });
  await expect(editor).toBeVisible();
  await editor.getByRole("textbox", { name: "Tarih", exact: true }).fill("2026-01-11");
  await expect(editor.getByRole("list", { name: "Günün konum rotası" })).toHaveCount(0);
  await editor.getByRole("button", { name: "Değişiklikleri kaydet" }).click();

  await expect(editor).toHaveCount(0);
  expect(submittedBody).toEqual({
    datePrecision: "day",
    date: "2026-01-11",
  });
});

test("day view edits a text memory without submitting its shared route", async ({ page }) => {
  let submittedBody: Record<string, unknown> | undefined;
  await page.route("**/api/memories/may-note", async (route) => {
    expect(route.request().method()).toBe("PATCH");
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 204 });
  });

  await page.getByTestId("memory-urla-road").click();
  await page.getByRole("dialog", { name: "Urla yolu" }).getByRole("button", {
    name: "Güne git",
  }).click();
  await page.getByRole("button", { name: "Bir cümle kalsın anısını düzenle" }).click();

  const editor = page.getByRole("dialog", { name: "Anıyı düzenle" });
  await editor.getByRole("textbox", { name: "Metin" }).fill("Düzenlenmiş günlük notu");
  await editor.getByRole("button", { name: "Değişiklikleri kaydet" }).click();

  await expect(editor).toHaveCount(0);
  expect(submittedBody).toEqual({
    datePrecision: "day",
    date: "2026-05-15",
    textContent: "Düzenlenmiş günlük notu",
  });
});

test("memory day view remains in the archive while diary is a separate route", async ({ page, isMobile }) => {
  const navigation = page.locator(isMobile ? ".mobile-nav" : ".desktop-sidebar");

  await page.getByTestId("memory-urla-road").click();
  await page.getByRole("dialog", { name: "Urla yolu" }).getByRole("button", { name: "Güne git" }).click();
  await expect(page.getByTestId("day-entry")).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Anılar", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("link", { name: "Günlük", exact: true })).toHaveAttribute("href", "/diary");
  await expect(navigation.getByRole("link", { name: "Günlük", exact: true })).not.toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("link", { name: "Çiçekler", exact: true })).toHaveCount(0);
});

test("day route editor submits an ordered route independently from every item", async ({ page }) => {
  let submittedBody: Record<string, unknown> | undefined;
  await page.route("**/api/memory-days/2026-05-15/locations", async (route) => {
    expect(route.request().method()).toBe("PATCH");
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 204 });
  });

  await page.getByTestId("memory-urla-road").click();
  await page.getByRole("dialog", { name: "Urla yolu" }).getByRole("button", {
    name: "Güne git",
  }).click();
  await page.getByRole("button", { name: "Rotayı düzenle" }).click();

  const editor = page.getByRole("dialog", { name: "Günün rotasını düzenle" });
  const route = editor.getByRole("list", { name: "Günün konum rotası" });
  await expect(route.getByRole("listitem")).toHaveCount(3);
  await editor.getByRole("button", { name: "1. konumu aşağı taşı" }).click();
  await editor.getByRole("button", { name: "Rotayı kaydet" }).click();

  await expect(editor).toHaveCount(0);
  await expect(page.getByTestId("day-entry").locator(".day-piece")).toHaveCount(3);
  expect(submittedBody).toEqual({
    locations: [
      { provinceCode: "35", districtCode: "1703" },
      { provinceCode: "35", districtCode: "1819" },
      { provinceCode: "35", districtCode: "1251" },
    ],
  });
});

test("day route editor can clear every location while keeping the day", async ({ page }) => {
  let submittedBody: Record<string, unknown> | undefined;
  await page.route("**/api/memory-days/2026-05-15/locations", async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 204 });
  });

  await page.getByTestId("memory-urla-road").click();
  await page.getByRole("dialog", { name: "Urla yolu" }).getByRole("button", {
    name: "Güne git",
  }).click();
  await page.getByRole("button", { name: "Rotayı düzenle" }).click();

  const editor = page.getByRole("dialog", { name: "Günün rotasını düzenle" });
  const removeLocation = editor.getByRole("button", { name: /konumu kaldır/ });
  await removeLocation.first().click();
  await removeLocation.first().click();
  await removeLocation.first().click();
  await expect(editor.getByText("Bu gün için henüz konum yok.")).toBeVisible();
  await editor.getByRole("button", { name: "Rotayı kaydet" }).click();

  await expect(editor).toHaveCount(0);
  await expect(page.getByTestId("day-entry")).toBeVisible();
  expect(submittedBody).toEqual({ locations: [] });
});

test("day route editor keeps the draft open when saving fails", async ({ page }) => {
  await page.route("**/api/memory-days/2026-05-15/locations", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Konum bilgisi geçersiz." }),
    }),
  );

  await page.getByTestId("memory-urla-road").click();
  await page.getByRole("dialog", { name: "Urla yolu" }).getByRole("button", {
    name: "Güne git",
  }).click();
  await page.getByRole("button", { name: "Rotayı düzenle" }).click();

  const editor = page.getByRole("dialog", { name: "Günün rotasını düzenle" });
  await editor.getByRole("button", { name: "Rotayı kaydet" }).click();

  await expect(editor).toBeVisible();
  await expect(editor.getByRole("alert")).toHaveText("Konum bilgisi geçersiz.");
});

test("year view keeps every dated item separate and excludes undated items", async ({ page }) => {
  await page.getByTestId("view-year").click();

  await expect(page.getByTestId("year-grid")).toBeVisible();
  await expect(page.getByTestId("year-grid").locator(".memory-tile")).toHaveCount(15);
  await expect(page.getByTestId("memory-undated-keepsake")).toHaveCount(0);
});

test("map has one card per memory day and opens the selected day", async ({ page }) => {
  await page.getByTestId("view-map").click();

  await expect(page.getByTestId("map-view")).toBeVisible();
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await expect(page.locator(".map-memory-card")).toHaveCount(4);
  await expect(page.locator(".map-stop")).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Yakınlaştır" })).toBeVisible();

  await page.getByTestId("map-card-2026-05-15").click();
  await expect(page.getByTestId("day-entry")).toBeVisible();
  await expect(page.getByTestId("date-label")).toContainText("15 Mayıs 2026");
});

test("theme cycles through explicit modes", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("responsive shell stays within the viewport", async ({ page, isMobile }) => {
  const sidebar = page.locator(".desktop-sidebar");
  const mobileNav = page.locator(".mobile-nav");

  if (isMobile) {
    await expect(sidebar).toBeHidden();
    await expect(mobileNav).toBeVisible();
  } else {
    await expect(sidebar).toBeVisible();
    await expect(mobileNav).toBeHidden();
  }

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("mobile long press expands a memory tile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Long-press behavior is mobile-specific");
  const tile = page.getByTestId("memory-urla-road");

  await tile.dispatchEvent("pointerdown", { pointerType: "touch", isPrimary: true });
  await page.waitForTimeout(470);
  await expect(tile).toHaveAttribute("data-expanded", "true");
  await tile.dispatchEvent("pointerup", { pointerType: "touch", isPrimary: true });
});

test("desktop hover stays on one tile while the grid reflows", async ({ page, isMobile }) => {
  test.skip(isMobile, "Mouse hover behavior is desktop-specific");
  const tile = page.getByTestId("memory-urla-road");

  await tile.hover();
  await expect(tile).toHaveAttribute("data-expanded", "true");
  await page.waitForTimeout(900);

  await expect(tile).toHaveAttribute("data-expanded", "true");
  await expect(page.locator(".memory-tile[data-expanded]")).toHaveCount(1);
});
