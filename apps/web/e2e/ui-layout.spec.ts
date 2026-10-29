import { expect, test } from "@playwright/test";

const isMobile = (name: string) => name.includes("mobile");

for (const variant of ["sade", "iki-sutun", "kart"]) {
  test(`login preview "${variant}" shows a working username + password form`, async ({ page }) => {
    await page.goto(`/ui/login?v=${variant}`);
    await expect(page.getByLabel("Kullanıcı adı")).toBeVisible();
    await expect(page.getByLabel("Şifre")).toHaveAttribute("type", "password");
    await expect(page.getByRole("button", { name: "Giriş yap" })).toBeVisible();
    // No sign-up or social login (decision G1).
    await expect(page.getByText(/kayıt ol|google/i)).toHaveCount(0);
  });
}

test("the two-column login shows the plate only on wide screens", async ({ page }, info) => {
  await page.goto("/ui/login?v=iki-sutun");
  const plate = page.getByRole("img", { name: /Curtis/ });
  if (isMobile(info.project.name)) await expect(plate).toBeHidden();
  else await expect(plate).toBeVisible();
});

for (const variant of ["ikon", "inset"]) {
  test(`shell preview "${variant}": sidebar on desktop, bottom bar on mobile`, async ({
    page,
  }, info) => {
    await page.goto(`/ui/shell?v=${variant}`);
    const bottomBar = page.getByRole("navigation", { name: "Alt menü" });
    const sidebar = page.locator('[data-slot="sidebar"]');

    if (isMobile(info.project.name)) {
      await expect(bottomBar).toBeVisible();
      await expect(bottomBar.getByRole("button", { name: "Anılar" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    } else {
      await expect(bottomBar).toBeHidden();
      await expect(sidebar).toHaveAttribute("data-state", "expanded");
      await page.getByRole("button", { name: "Toggle Sidebar" }).first().click();
      await expect(sidebar).toHaveAttribute("data-state", "collapsed");
      await expect(sidebar).toHaveAttribute("data-collapsible", "icon");
    }
  });
}
