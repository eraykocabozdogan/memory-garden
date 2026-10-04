import { expect, test } from "@playwright/test";

import { buildGardenDays, spiralCoordinate } from "../../features/diary/garden-layout";

test.beforeEach(async ({ page }) => {
  await page.goto("/prototype/diary");
});

test("garden days start at the center and expand clockwise in a square spiral", () => {
  expect(Array.from({ length: 9 }, (_, index) => spiralCoordinate(index))).toEqual([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
  ]);

  expect(buildGardenDays("2026-09-01T09:00:00+03:00", [
    { entryId: "flower-day", flowerId: "rosa", plantedAt: "2026-08-31T20:00:00+03:00" },
  ])).toMatchObject([
    { dayKey: "2026-08-30", index: 0, flowers: [] },
    { dayKey: "2026-08-31", index: 1, flowers: [{ flowerId: "rosa" }] },
    { dayKey: "2026-09-01", index: 2, flowers: [] },
  ]);
});

test("diary is independent from memories and has no separate flowers navigation", async ({ page, isMobile }) => {
  const navigation = page.locator(isMobile ? ".mobile-nav" : ".desktop-sidebar");
  await expect(navigation.getByRole("link", { name: "Günlük", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("link", { name: "Anılar", exact: true })).toHaveAttribute("href", "/memories");
  await expect(navigation.getByRole("link", { name: "Çiçekler", exact: true })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: /yorum/i })).toHaveCount(0);
});

test("the flower catalog uses alphabet tabs and responsive book pages", async ({ page, isMobile }) => {
  await page.getByRole("button", { name: "Çiçek kataloğu", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Çiçek kataloğu" });
  await expect(dialog).toBeVisible();
  const viewport = page.viewportSize();
  const dialogSize = await dialog.evaluate((element) => ({
    width: element.clientWidth,
    height: element.clientHeight,
  }));
  expect(viewport).not.toBeNull();
  expect(dialogSize.width).toBeGreaterThan(viewport!.width * 0.95);
  expect(dialogSize.height).toBeGreaterThan(viewport!.height * 0.95);
  await expect(dialog.getByRole("navigation", { name: "Çiçek harf ayraçları" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "K harfi" })).toBeVisible();

  const platePage = dialog.getByTestId("flower-plate-page");
  const copyPage = dialog.getByTestId("flower-copy-page");
  const mobilePage = dialog.getByTestId("flower-mobile-page");
  const contentPage = isMobile ? mobilePage : copyPage;
  const imagePage = isMobile ? mobilePage : platePage;

  await expect(contentPage).toBeVisible();
  await expect(imagePage.getByRole("img")).toBeVisible();
  await expect(contentPage).toContainText("Acem borusu");
  await expect(contentPage).toContainText("ayrılık, kolay kopuş");
  if (isMobile) {
    await expect(platePage).toBeHidden();
    await expect(copyPage).toBeHidden();
    await expect(mobilePage).toHaveCSS("background-color", "rgb(234, 223, 190)");
  } else {
    await expect(platePage).toBeVisible();
    await expect(copyPage).toBeVisible();
    await expect(mobilePage).toBeHidden();
    await expect(platePage).toContainText("Acem borusu");
    await expect(copyPage).toContainText("Acem borusu");
    const leftPageBox = await platePage.boundingBox();
    const rightPageBox = await copyPage.boundingBox();
    const pageBackgrounds = await Promise.all([
      platePage.evaluate((element) => getComputedStyle(element).backgroundColor),
      copyPage.evaluate((element) => getComputedStyle(element).backgroundColor),
    ]);
    expect(leftPageBox).not.toBeNull();
    expect(rightPageBox).not.toBeNull();
    expect(pageBackgrounds[0]).toBe("rgb(234, 223, 190)");
    expect(pageBackgrounds[1]).toBe(pageBackgrounds[0]);
    expect(Math.abs(rightPageBox!.y - leftPageBox!.y)).toBeLessThan(2);
    expect(rightPageBox!.x).toBeGreaterThanOrEqual(leftPageBox!.x + leftPageBox!.width - 2);
  }

  const firstPageName = await contentPage.getByRole("heading", { level: 2 }).textContent();
  await dialog.getByRole("button", { name: "Sonraki sayfa" }).click();
  await expect(dialog.locator(".diary-flower-spread")).toHaveAttribute("data-page-direction", "forward");
  await expect(contentPage.getByRole("heading", { level: 2 })).not.toHaveText(firstPageName ?? "");

  await dialog.getByRole("button", { name: "K harfi" }).click();
  await expect(dialog.getByRole("complementary", { name: "Çiçek listesi" })).toBeVisible();
  await dialog.getByRole("searchbox", { name: "Çiçeklerde ara" }).fill("kardelen");
  await dialog.getByRole("button", { name: /Kardelen/ }).click();
  await expect(contentPage).toContainText("umut, teselli, zor günde dostluk");
  await expect(imagePage.getByRole("img", { name: /Kardelen, Curtis/ })).toBeVisible();
  await expect(contentPage.locator(".diary-flower-narrative")).toHaveCount(2);
  await expect(contentPage.locator(".diary-flower-narrative").nth(1)).toHaveCSS("border-top-style", "solid");
  await expect(dialog.getByRole("button", { name: /bırak/i })).toHaveCount(0);

  if (!isMobile) {
    await dialog.getByRole("button", { name: "G harfi" }).click();
    await dialog.getByRole("searchbox", { name: "Çiçeklerde ara" }).fill("gül");
    await dialog.locator('[data-flower-id="rosa"]').click();
    const copyOverflow = await copyPage.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(copyOverflow.scrollHeight).toBeLessThanOrEqual(copyOverflow.clientHeight + 1);
  }
});

test("reduced motion keeps catalog page navigation functional", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Çiçek kataloğu", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Çiçek kataloğu" });
  const firstPage = dialog.getByTestId(isMobile ? "flower-mobile-page" : "flower-copy-page");
  await expect(firstPage).toContainText("Acem borusu");
  await dialog.getByRole("button", { name: "Sonraki sayfa" }).click();
  await expect(firstPage).not.toContainText("Acem borusu");
});

test("expired own entries remain private while partner entries expose flower-only responses", async ({ page }) => {
  await expect(page.getByTestId("diary-entry-own-expired")).toContainText("Artık yalnızca sende");
  await expect(page.getByTestId("diary-entry-own-expired").getByRole("button", { name: "Düzenle" })).toHaveCount(0);
  await expect(page.getByTestId("diary-entry-partner-today").getByRole("button", { name: "Çiçek bırak" })).toBeVisible();
  await expect(page.getByTestId("diary-entry-own-active")).toContainText("Müge");
  await expect(page.getByTestId("diary-entry-own-active")).toContainText("mutluluğun geri dönüşü");
});

test("the garden shows flower days and empty grass days on isometric spiral tiles", async ({ page }) => {
  await page.getByRole("tab", { name: "Bahçe" }).click();

  const garden = page.getByRole("region", { name: "Ortak çiçek bahçemiz" });
  await expect(garden).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Günlük metni" })).toHaveCount(0);

  const centerDay = garden.locator('[data-garden-day="2026-08-30"]');
  const secondDay = garden.locator('[data-garden-day="2026-08-31"]');
  await expect(centerDay).toHaveAttribute("data-spiral-index", "0");
  await expect(centerDay).toHaveAttribute("data-grid-x", "0");
  await expect(centerDay).toHaveAttribute("data-grid-y", "0");
  await expect(centerDay).toHaveAccessibleName("30 Ağustos 2026: çiçek yok");
  await expect(secondDay).toHaveAttribute("data-spiral-index", "1");
  await expect(secondDay).toHaveAttribute("data-grid-x", "1");
  await expect(secondDay).toHaveAttribute("data-grid-y", "0");
  await expect(secondDay).toHaveAccessibleName(/31 Ağustos 2026: Müge/);

  await centerDay.click();
  await expect(garden).toContainText("Bu gün çimen olarak kaldı.");
  await page.getByRole("tab", { name: "Günlük" }).click();
  await expect(page.getByRole("textbox", { name: "Günlük metni" })).toBeVisible();
});

test("the prototype keeps partner flower responses local and replaceable", async ({ page }) => {
  let apiRequestCount = 0;
  await page.route("**/api/diary/partner-today/flower", async (route) => {
    apiRequestCount += 1;
    await route.abort();
  });

  const partnerEntry = page.getByTestId("diary-entry-partner-today");
  await partnerEntry.getByRole("button", { name: "Çiçek bırak" }).click();
  let dialog = page.getByRole("dialog", { name: "Bir çiçek bırak" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Çiçek menüsünü aç" }).click();
  await dialog.getByRole("searchbox", { name: "Çiçeklerde ara" }).fill("kardelen");
  await dialog.getByRole("button", { name: /Kardelen/ }).click();
  await expect(dialog).toContainText("umut, teselli, zor günde dostluk");
  await dialog.getByRole("button", { name: "Kardelen bırak" }).click();

  await expect(dialog).toHaveCount(0);
  await expect(partnerEntry).toContainText("Kardelen");
  await expect(partnerEntry).toContainText("umut, teselli, zor günde dostluk");

  await partnerEntry.getByRole("button", { name: "Çiçeği değiştir" }).click();
  dialog = page.getByRole("dialog", { name: "Bir çiçek bırak" });
  await dialog.getByRole("button", { name: "G harfi" }).click();
  await dialog.getByRole("searchbox", { name: "Çiçeklerde ara" }).fill("gül");
  await dialog.locator('[data-flower-id="rosa"]').click();
  await dialog.getByRole("button", { name: "Gül bırak" }).click();

  await expect(dialog).toHaveCount(0);
  await expect(partnerEntry).toContainText("Gül");
  await expect(partnerEntry).not.toContainText("Kardelen");
  expect(apiRequestCount).toBe(0);

  await page.getByRole("tab", { name: "Bahçe" }).click();
  await expect(page.locator('[data-garden-day="2026-08-31"]')).toHaveAccessibleName(/Müge, Gül/);
});

test("the composer publishes a standalone diary entry", async ({ page }) => {
  let submittedBody: unknown;
  await page.route("**/api/diary", async (route) => {
    expect(route.request().method()).toBe("POST");
    submittedBody = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "new" }) });
  });

  await page.getByRole("textbox", { name: "Günlük metni" }).fill("Bugünün kendi günlüğü.");
  await page.getByRole("button", { name: "Günlüğü yayımla" }).click();
  expect(submittedBody).toEqual({ content: "Bugünün kendi günlüğü." });
});
