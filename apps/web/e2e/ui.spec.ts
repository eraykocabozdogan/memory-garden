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

test("the UI preview switches font sets and the handwriting accent", async ({ page }) => {
  await page.goto("/ui");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-fonts", "bookish");

  await page.getByRole("button", { name: "Soft" }).click();
  await expect(html).toHaveAttribute("data-fonts", "soft");
  await page.getByRole("button", { name: "Kalam" }).click();
  await expect(html).toHaveAttribute("data-hand", "kalam");

  // The heading really uses the chosen family once its font file has loaded.
  const heading = page.getByRole("heading", { name: "Bahçemizde ilk çiçek" });
  await expect(heading).toHaveCSS("font-family", /Fraunces/);
  const loaded = await page.evaluate(
    `document.fonts.ready.then(() => document.fonts.check('16px "Fraunces Variable"', "ğşİ"))`,
  );
  expect(loaded).toBe(true);
});
