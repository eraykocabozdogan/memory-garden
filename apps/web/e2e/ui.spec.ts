import { expect, test } from "@playwright/test";

test("the UI preview switches palette and mode on <html>", async ({ page }) => {
  await page.goto("/ui");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-palette", "parchment");

  await page.getByRole("button", { name: "Rosewood" }).click();
  await expect(html).toHaveAttribute("data-palette", "rosewood");
  await expect(page.getByTestId("palette-note")).toContainText("Rosewood");

  await page.getByRole("button", { name: "Light" }).click();
  await expect(html).toHaveClass(/dark/);

  // The choice survives a reload.
  await page.reload();
  await expect(html).toHaveAttribute("data-palette", "rosewood");
  await expect(html).toHaveClass(/dark/);
});
