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

test("the three chosen text motions render and can be replayed", async ({ page }) => {
  await page.goto("/ui/yazi");

  for (const id of ["9-2", "9-3", "9-5"]) {
    await expect(page.getByTestId(`aday-${id}`)).toBeVisible();
  }

  // The animations end on the plain text, so the heading reads the same however it arrived.
  await expect(page.getByTestId("aday-9-2")).toContainText("Bahçende 47 anı açtı");
  // The counter reaches its target rather than stopping somewhere along the way.
  await expect(page.getByTestId("aday-9-5")).toContainText("47");
  await expect(page.getByTestId("aday-9-5")).toContainText("128");

  await page.getByRole("button", { name: "Tekrar oynat" }).click();
  await expect(page.getByTestId("aday-9-2")).toContainText("Bahçende 47 anı açtı");
});

test("the login sheet carries the chosen text motion", async ({ page }) => {
  await page.goto("/ui/login");

  await expect(page.locator(".anim-elyazisi")).toHaveText("Her anı bir çiçek…");
  await expect(page.getByTestId("label")).toHaveClass(/anim-beliris/);
  // The form is usable while the reveal runs: nothing is hidden once the animation ends.
  await page.getByLabel("Kullanıcı adı").click();
  await expect(page.getByLabel("Kullanıcı adı")).toBeFocused();
});

test("text animations are skipped when the visitor asks for less motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ui/yazi");

  // No animation runs at all: the text is simply there.
  // (Evaluated as a string: the e2e tsconfig has no DOM types.)
  const running = (await page.evaluate(
    `document.getAnimations().filter((a) => a.playState === "running").length`,
  )) as number;
  expect(running).toBe(0);
  await expect(page.getByTestId("aday-9-5")).toContainText("47");
});

test("the motion page opens a memory and changes the list", async ({ page }) => {
  await page.goto("/ui/gecis");

  // The shared-element scenario: a card opens into its detail and closes again.
  await page.locator('[data-testid="senaryo-kart"] button').first().click();
  await expect(page.getByRole("button", { name: "Kapat" })).toBeVisible();
  await page.getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByRole("button", { name: "Kapat" })).toHaveCount(0);

  // The list scenario: adding and removing really change the list, transition or not.
  const rows = page.locator('[data-testid="senaryo-liste"] li');
  const before = await rows.count();
  await page.getByRole("button", { name: "Anı ekle" }).click();
  await expect(rows).toHaveCount(before + 1);
  await page.locator('[data-testid="senaryo-liste"] li').first().getByRole("button").click();
  await expect(rows).toHaveCount(before);
});

test("a page change still lands on the new page with view transitions on", async ({ page }) => {
  await page.goto("/ui");
  await page.getByRole("link", { name: "Hareket" }).click();
  await expect(page.getByRole("heading", { name: "Hareket", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "← Önizleme" }).click();
  await expect(page.getByRole("heading", { name: "Tasarım önizlemesi" })).toBeVisible();
});

test("the upload draft queues files, two at a time, and splits the big ones", async ({ page }) => {
  await page.goto("/ui/bilesenler");

  // Three files: the queue should start two and hold the third back.
  await page.setInputFiles('[data-testid="yukleme"] input[type=file]', [
    { name: "kusadasi.heic", mimeType: "image/heic", buffer: Buffer.alloc(3_500_000) },
    { name: "ilk-kar.mp4", mimeType: "video/mp4", buffer: Buffer.alloc(40_000_000) },
    { name: "mutfak.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(1_200_000) },
  ]);

  const rows = page.locator('[data-testid="yukleme"] li');
  await expect(rows).toHaveCount(3);
  await expect(rows.filter({ hasText: "yükleniyor" })).toHaveCount(2);
  await expect(rows.filter({ hasText: "bekliyor" })).toHaveCount(1);

  // Every file finishes, and the queue drains rather than stalling on the third.
  await expect(rows.filter({ hasText: "bitti" })).toHaveCount(3, { timeout: 15_000 });
});

test("the gallery opens a photo full screen and walks through with the keyboard", async ({
  page,
}) => {
  await page.goto("/ui/bilesenler");

  await page.locator('[data-testid="galeri"] button img').first().click();
  const viewer = page.locator('[data-slot="dialog-content"]');
  await expect(viewer).toBeVisible();
  const first = await viewer.getByRole("heading").textContent();

  // Press on the dialog itself: page.keyboard depends on where focus happened to land.
  await viewer.press("ArrowRight");
  await expect(viewer.getByRole("heading")).not.toHaveText(first ?? "");

  // The photo is made to fit the screen rather than overflowing it.
  const fits = (await page.evaluate(
    `(() => {
      const img = document.querySelector('[data-slot="dialog-content"] img');
      return img.getBoundingClientRect().height <= window.innerHeight;
    })()`,
  )) as boolean;
  expect(fits).toBe(true);

  await viewer.press("Escape");
  await expect(viewer).toHaveCount(0);
});

test("the gallery is divided by month and the countdown reaches its number", async ({ page }) => {
  await page.goto("/ui/bilesenler");

  const months = page.locator('[data-testid="galeri"] h3');
  // The page is a SPA, so wait for it to render before counting.
  await expect(months.first()).toBeVisible();
  expect(await months.count()).toBeGreaterThan(1);
  await expect(months.first()).toHaveText(/\d{4}/);

  // The countdown settles on a real number of days, not on zero.
  await expect(page.getByTestId("sayim")).toContainText(/[1-9]\d*/);
});

test("the viewer zooms in and back out", async ({ page }) => {
  await page.goto("/ui/bilesenler");

  await page.locator('[data-testid="galeri"] button img').first().click();
  const viewer = page.locator('[data-slot="dialog-content"]');
  await expect(viewer).toBeVisible();
  await expect(viewer.getByTestId("zoom")).toHaveText("100%");

  await viewer.getByRole("button", { name: "Yakınlaştır" }).click();
  await expect(viewer.getByTestId("zoom")).not.toHaveText("100%");

  // Double-clicking the photo toggles: once back to actual size, once in again.
  await viewer.locator("img").dblclick();
  await expect(viewer.getByTestId("zoom")).toHaveText("100%");
  await viewer.locator("img").dblclick();
  await expect(viewer.getByTestId("zoom")).not.toHaveText("100%");
});

test("on a wide screen the pages fill the width but text stays readable", async ({
  page,
}, testInfo) => {
  test.skip(isMobile(testInfo.project.name), "about wide screens");
  // A tablet held sideways.
  await page.setViewportSize({ width: 1366, height: 1024 });

  for (const path of ["/ui", "/ui/icons", "/ui/yazi", "/ui/gecis", "/ui/bilesenler"]) {
    await page.goto(path);
    const main = page.locator("main");
    await expect(main).toBeVisible();
    const box = await main.boundingBox();
    expect(box?.width, path).toBeGreaterThan(1366 * 0.9);
  }

  // The gallery gains columns instead of leaving the sides empty.
  await page.goto("/ui/bilesenler");
  const gallery = page.locator('[data-testid="galeri"] [class*="columns-"]').first();
  await expect(gallery).toHaveCSS("column-count", "4");

  // The intro paragraph keeps a readable line length (max-w-prose is 65ch).
  const intro = page.locator("main header p").first();
  const introBox = await intro.boundingBox();
  expect(introBox?.width).toBeLessThan(760);
});
