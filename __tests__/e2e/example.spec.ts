import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/FilterCN/);
});

test("hero heading", async ({ page }) => {
  await page.goto("/");

  // Check the hero heading
  const heading = page.getByRole("heading", { name: /The Ultimate\s*Conditional Filter\s*for React/i });
  await expect(heading).toBeVisible();
});
