import { expect, test } from "@playwright/test";

test("the UI preview applies the Parchment theme and toggles dark mode", async ({ page }) => {
  await page.goto("/ui");
  const html = page.locator("html");
  await expect(page.getByTestId("theme-note")).toContainText("Parchment");
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Light" }).click();
  await expect(html).toHaveClass(/dark/);

  // The choice survives a reload.
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

test("every control button keeps its base styling", async ({ page }) => {
  await page.goto("/ui");
  for (const name of ["Save memory", "Cancel", "Add flower", "Outline", "Delete"]) {
    const box = await page.getByRole("button", { name }).boundingBox();
    expect(box?.height, `${name} should be 40px tall`).toBe(40);
  }
});

test("shape variants change corners, shadow and card padding", async ({ page }) => {
  await page.goto("/ui");
  const card = page.getByRole("article");

  // Paper (default)
  await expect(card).toHaveCSS("border-radius", "8px");
  await expect(card).toHaveCSS("padding", "20px");
  await expect(card).not.toHaveCSS("box-shadow", "none");

  await page.getByRole("button", { name: "Soft" }).click();
  await expect(card).toHaveCSS("border-radius", "16px");
  await expect(card).toHaveCSS("padding", "24px");

  await page.getByRole("button", { name: "Archive" }).click();
  await expect(card).toHaveCSS("border-radius", "4px");
  await expect(card).toHaveCSS("padding", "16px");
  await expect(card).toHaveCSS("box-shadow", "none");
});

test("paper grain toggles a background image on the page", async ({ page }) => {
  await page.goto("/ui");
  const body = page.locator("body");
  await expect(body).toHaveCSS("background-image", "none");

  await page.getByRole("button", { name: /Paper grain/ }).click();
  await expect(body).toHaveCSS("background-image", /url\(/);
});
