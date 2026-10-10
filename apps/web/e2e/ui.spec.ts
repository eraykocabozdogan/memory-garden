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
