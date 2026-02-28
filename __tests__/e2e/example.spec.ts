import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Create Next App/);
});

test("get started link", async ({ page }) => {
  await page.goto("/");

  // Click the get started link.
  await page.getByRole("heading", { name: "To get started, edit the page.tsx file." }).isVisible();
});
