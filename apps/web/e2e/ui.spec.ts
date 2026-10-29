import { expect, test } from "@playwright/test";

test("the preview starts light and the theme toggle persists dark mode", async ({ page }) => {
  await page.goto("/ui");
  const html = page.locator("html");
  await expect(page.getByTestId("theme-note")).toContainText("Parchment");
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Açık tema" }).click();
  await expect(html).toHaveClass(/dark/);

  // next-themes stores the choice, so it survives a reload.
  await page.reload();
  await expect(html).toHaveClass(/dark/);
});

test("headings, body and handwriting use the chosen self-hosted fonts", async ({ page }) => {
  await page.goto("/ui");
  await expect(page.getByRole("heading", { name: "Bahçemizde ilk çiçek" })).toHaveCSS(
    "font-family",
    /Lora/,
  );
  await expect(page.locator("body")).toHaveCSS("font-family", /Source Sans 3/);
  await expect(page.getByText("Seni düşündüğüm bir akşam…")).toHaveCSS("font-family", /Caveat/);

  // The font files really loaded and cover Turkish letters.
  const loaded = await page.evaluate(
    `document.fonts.ready.then(() =>
      ['Lora Variable', 'Source Sans 3 Variable', 'Caveat Variable'].every((family) =>
        document.fonts.check('16px "' + family + '"', 'ğşıİçöü')))`,
  );
  expect(loaded).toBe(true);
});

test("buttons keep their shadcn styling and theme colours", async ({ page }) => {
  await page.goto("/ui");
  const row = page.getByTestId("button-row");
  for (const name of ["Anıyı kaydet", "Vazgeç", "Çiçek ekle", "Daha fazla", "Sil"]) {
    const box = await row.getByRole("button", { name }).boundingBox();
    expect(box?.height, `${name} should be 36px tall`).toBe(36);
  }
  // The primary button is painted with the Parchment primary, not shadcn's neutral default.
  // (Evaluated as strings: the e2e tsconfig has no DOM types.)
  const [primary, expected] = (await page.evaluate(
    `(() => {
      const button = document.querySelector('[data-testid="button-row"] button');
      const probe = document.createElement('div');
      probe.style.color = 'var(--primary)';
      document.body.append(probe);
      const result = [getComputedStyle(button).backgroundColor, getComputedStyle(probe).color];
      probe.remove();
      return result;
    })()`,
  )) as [string, string];
  expect(primary).toBe(expected);
});

test("the memory card uses the Paper shape tokens", async ({ page }) => {
  await page.goto("/ui");
  const card = page.getByTestId("memory-card");
  await expect(card).toHaveCSS("border-radius", "8px");
  await expect(card).toHaveCSS("padding-top", "20px");
  await expect(card).not.toHaveCSS("box-shadow", "none");
});

test("menu, dialog, date picker and toast open", async ({ page }) => {
  await page.goto("/ui");

  await page.getByRole("button", { name: "Seçenekler" }).click();
  await expect(page.getByRole("menuitem", { name: "Çöp kutusuna taşı" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Anıyı sil…" }).click();
  await expect(page.getByRole("dialog")).toContainText("çöp kutusuna taşınsın mı?");
  await page.getByRole("button", { name: "Vazgeç" }).last().click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByRole("button", { name: "12 Ekim 2026" }).click();
  const picker = page.locator('[data-slot="popover-content"]');
  await expect(picker.getByRole("grid")).toBeVisible();
  await expect(picker).toContainText("Ekim 2026");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Bildirim göster" }).click();
  await expect(page.getByText("Anı kaydedildi")).toBeVisible();
});

test("paper grain is on by default and can be turned off", async ({ page }) => {
  await page.goto("/ui");
  const body = page.locator("body");
  await expect(body).toHaveCSS("background-image", /url\(/);

  await page.getByRole("button", { name: /Kâğıt dokusu/ }).click();
  await expect(body).toHaveCSS("background-image", "none");
});
