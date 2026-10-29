import { expect, test } from "@playwright/test";

const isMobile = (name: string) => name.includes("mobile");

test("herbarium login shows a working username + password form", async ({ page }) => {
  await page.goto("/ui/login");
  await expect(page.getByLabel("Kullanıcı adı")).toBeVisible();
  await expect(page.getByLabel("Şifre")).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Giriş yap" })).toBeVisible();
  // No sign-up or social login (decision G1).
  await expect(page.getByText(/kayıt ol|google/i)).toHaveCount(0);
});

test("the label names today's plate and carries the chosen details", async ({ page }, info) => {
  await page.goto("/ui/login");
  const plate = page.getByRole("img", { name: /Curtis çizimi/ });
  await expect(plate).toBeVisible();
  const name = ((await plate.getAttribute("alt")) ?? "").split(":")[0] ?? "";
  expect(name.length).toBeGreaterThan(0);
  await expect(page.getByTestId("label")).toContainText(name);
  await expect(page.getByTestId("label")).toContainText("Memory Garden Herbaryumu");
  await expect(page.getByText("Her anı bir çiçek…")).toBeVisible();
  // The label never shows Turkish variant words as if they were Latin ("Rosa kırmızı").
  await expect(page.getByTestId("label")).not.toContainText(/Rosa (kırmızı|tomurcuk|kurumuş)/);

  // Underlined fields keep a visible bottom border.
  const field = page.getByLabel("Kullanıcı adı");
  await expect(field).toHaveCSS("border-top-width", "0px");
  await expect(field).toHaveCSS("border-bottom-width", "1px");

  // Side by side on wide screens, stacked on phones.
  const labelBox = await page.getByTestId("label").boundingBox();
  const plateBox = await plate.boundingBox();
  if (info.project.name.includes("mobile")) {
    expect(labelBox?.y).toBeGreaterThan(plateBox?.y ?? 0);
    await expect(page.getByTestId("stamp")).toBeHidden();
  } else {
    expect(labelBox?.x).toBeGreaterThan((plateBox?.x ?? 0) + (plateBox?.width ?? 0) - 1);
    await expect(page.getByTestId("stamp")).toBeVisible();
  }
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
