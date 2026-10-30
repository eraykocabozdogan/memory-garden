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

test("icons are Phosphor: light by default, regular in navigation", async ({ page }) => {
  await page.goto("/ui/icons");
  const sets = page.getByTestId("icon-set");
  await expect(sets).toHaveCount(2);
  for (let i = 0; i < 2; i++) await expect(sets.nth(i).locator("svg")).toHaveCount(11);

  // The global default (IconContext in root.tsx) and the navigation override really differ:
  // Phosphor draws each weight as a different path, so compare the "Ekle" glyphs.
  const light = await sets.nth(0).locator("svg").nth(5).innerHTML();
  const regular = await sets.nth(1).locator("svg").nth(5).innerHTML();
  expect(light).not.toBe(regular);
  const buttonPlus = await page
    .getByRole("button", { name: "Anı ekle" })
    .locator("svg")
    .innerHTML();
  expect(buttonPlus).toBe(light);
});

test("the silk background sits behind the sheet and keeps the form usable", async ({ page }) => {
  // This headless browser has no GPU and draws WebGL on the CPU, so a running full-screen
  // shader starves the page. With "reduce motion" on, the silk draws one frame and stops.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ui/login");

  for (const name of ["İpek + buket"]) {
    await page.getByRole("button", { name, exact: true }).click();
    const layer = page.getByTestId("background");
    await expect(layer.locator("canvas")).toHaveCount(1);
    await expect(layer).toHaveAttribute("aria-hidden", "true");
    await expect(layer).toHaveAttribute("inert", "");
    // The background must never sit on top of the form.
    await page.getByLabel("Kullanıcı adı").click();
    await expect(page.getByLabel("Kullanıcı adı")).toBeFocused();
  }

  await page.getByRole("button", { name: "Yok", exact: true }).click();
  await expect(page.getByTestId("background")).toHaveCount(0);

  // "Sayfayı gizle" hides the sheet so the background can be judged on its own.
  await page.getByRole("button", { name: "Sayfayı gizle" }).click();
  await expect(page.getByLabel("Kullanıcı adı")).toBeHidden();
});

test("every text animation candidate renders and can be replayed", async ({ page }) => {
  await page.goto("/ui/yazi");

  const ids = ["9-1", "9-2", "9-3", "9-3b", "9-4a", "9-4b", "9-4c", "9-4d", "9-4e", "9-5"];
  for (const id of ids) {
    await expect(page.getByTestId(`aday-${id}`)).toBeVisible();
  }

  // The animations end on the plain text, so the heading reads the same however it arrived.
  await expect(page.getByTestId("aday-9-2")).toContainText("Bahçende 47 anı açtı");
  // The counter reaches its target rather than stopping somewhere along the way.
  await expect(page.getByTestId("aday-9-5")).toContainText("47");
  await expect(page.getByTestId("aday-9-5")).toContainText("128 gün");

  await page.getByRole("button", { name: "Tekrar oynat" }).click();
  await expect(page.getByTestId("aday-9-2")).toContainText("Bahçende 47 anı açtı");
});

test("text animations are skipped when the visitor asks for less motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ui/yazi");

  // No animation runs at all: the text is simply there, including the typewriter's full line.
  // (Evaluated as a string: the e2e tsconfig has no DOM types.)
  const running = (await page.evaluate(
    `document.getAnimations().filter((a) => a.playState === "running").length`,
  )) as number;
  expect(running).toBe(0);
  await expect(page.getByTestId("aday-9-4c")).toContainText("Bahçende 47 anı açtı");
  // The written line is an image, so its text has to reach a screen reader through its label.
  await expect(page.getByTestId("aday-9-3b").getByRole("img")).toHaveAttribute(
    "aria-label",
    "Her anı bir çiçek…",
  );
});
