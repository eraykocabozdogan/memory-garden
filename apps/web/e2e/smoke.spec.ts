import { expect, test } from "@playwright/test";

test("the prerendered home page is served as HTML", async ({ page, request }) => {
  const response = await request.get("/");
  expect(await response.text()).toContain("Memory Garden");

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Memory Garden" })).toBeVisible();
});

test("app routes load the SPA, which reaches the API", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("api-status")).toHaveText("API: çalışıyor");
});

test("unknown API routes return JSON 404s", async ({ request }) => {
  const response = await request.get("/api/does-not-exist");
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({ error: "Not found" });
});
