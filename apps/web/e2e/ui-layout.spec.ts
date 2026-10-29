import { expect, test } from "@playwright/test";

const isMobile = (name: string) => name.includes("mobile");

test("herbarium login shows a working username + password form", async ({ page }) => {
  await page.goto("/ui/login");
  await expect(page.getByLabel("Kullanıcı adı")).toBeVisible();
  await expect(page.getByLabel("Şifre")).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Giriş yap" })).toBeVisible();
  // No sign-up or social login (decision G1).
  await expect(page.getByText(/kayıt ol|google/i)).toHaveCount(0);
  // The plate and its label name the same flower.
  await expect(page.getByRole("img", { name: /Hercai menekşe/ })).toBeVisible();
  await expect(page.getByTestId("label")).toContainText("Hercai menekşe");
});

test("every detail switch changes the page and is kept in the URL", async ({ page }) => {
  await page.goto("/ui/login");
  const main = page.locator("main");
  const panel = page.getByRole("complementary", { name: "Ayrıntı seçenekleri" });

  await panel.getByRole("button", { name: "Yan yana" }).click();
  await expect(main).toHaveAttribute("data-layout", "yan");
  await panel.getByRole("button", { name: "Foto köşeliği" }).click();
  await expect(main).toHaveAttribute("data-mount", "kose");
  await panel.getByRole("button", { name: "Sade kart" }).click();
  await expect(page.getByTestId("label")).not.toContainText("Herbaryumu");
  await panel.getByRole("button", { name: "Kutu" }).click();
  await expect(page.getByLabel("Kullanıcı adı")).toHaveCSS("border-top-width", "1px");
  await panel.getByRole("button", { name: "El yazısı not" }).click();
  await expect(page.getByText("Her anı bir çiçek…")).toHaveCount(0);

  await expect(page).toHaveURL(/yer=yan/);
  await page.reload();
  await expect(main).toHaveAttribute("data-layout", "yan");
  await expect(main).toHaveAttribute("data-mount", "kose");
});

test("underlined fields keep a visible bottom border", async ({ page }) => {
  await page.goto("/ui/login");
  const field = page.getByLabel("Kullanıcı adı");
  await expect(field).toHaveCSS("border-top-width", "0px");
  await expect(field).toHaveCSS("border-bottom-width", "1px");
});

test("inset shell: sidebar on desktop, bottom bar on mobile", async ({ page }, info) => {
  await page.goto("/ui/shell");
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
    await expect(sidebar).toHaveAttribute("data-variant", "inset");
  }
});
