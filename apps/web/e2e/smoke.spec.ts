import { expect, test } from "@playwright/test";

test("the prerendered home page is served as HTML", async ({ page, request }) => {
  const response = await request.get("/");
  expect(await response.text()).toContain("Memory Garden");

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Memory Garden" })).toBeVisible();
});

test("the API answers through the Worker", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(await response.json()).toEqual({ ok: true });
});

test("signed out, API routes answer 401 in JSON, never the SPA shell", async ({ request }) => {
  const response = await request.get("/api/does-not-exist");
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: "Unauthorized" });
});
