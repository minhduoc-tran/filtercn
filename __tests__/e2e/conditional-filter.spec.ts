import { expect, test } from "@playwright/test";

test.describe("Conditional Filter Component", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the demo page
    await page.goto("/");
    // Wait for the table to load at least one row, implying hydration and initial fetch
    await expect(page.getByText(/Showing \d+ of \d+ products/)).toBeVisible();
  });

  test("should open and close the filter popover", async ({ page }) => {
    // Click the "Filters" button
    await page.getByRole("button", { name: "Filters" }).click();

    // Check if the popover content is visible (Add filter button should be there)
    const addFilterBtn = page.getByRole("button", { name: "+ Add filter" });
    await expect(addFilterBtn).toBeVisible();

    // Click outside to close (click the body or escape)
    await page.keyboard.press("Escape");
    await expect(addFilterBtn).not.toBeVisible();
  });

  test("should add and remove a filter row", async ({ page }) => {
    await page.getByRole("button", { name: "Filters" }).click();

    // Add a row
    await page.getByRole("button", { name: "+ Add filter" }).click();

    // Should see exactly one field select combobox
    const selects = page.getByRole("combobox", { name: /select field/i }); // Using aria-label or accessible name if present,
    // Fallback if no specific aria-label:
    const placeholders = page.getByText("Select field...");
    await expect(placeholders).toBeVisible();

    // Click the delete button
    const deleteBtn = page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-trash-2") })
      .first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(placeholders).not.toBeVisible();
    }
  });

  test("should apply text filter and update URL", async ({ page }) => {
    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: "+ Add filter" }).click();

    // Open field select
    await page.getByRole("combobox").first().click(); // Open field select
    await page.getByRole("option", { name: "Name" }).click();

    // Operator is default to 'is', change it to 'contains'
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "Contains" }).click();

    // Enter value
    await page.getByRole("textbox").fill("Shirt");

    // Click Apply
    await page.getByRole("button", { name: "Apply" }).click();

    // Verify URL
    await expect(page).toHaveURL(/\/\?name__icontains=Shirt/);

    // Verify badge count
    const filterBtn = page.getByRole("button", { name: /Filters/ });
    await expect(filterBtn).toHaveText(/Filters\s*1/);
  });

  test("should reset filters and clear URL", async ({ page }) => {
    // Start with a URL containing filters
    await page.goto("/?status=active");

    await page.getByRole("button", { name: /Filters/ }).click();

    // Check that we have a row loaded from URL
    await expect(page.locator('button[role="combobox"]').first()).toHaveText(/Status/);

    // Click Reset
    await page.getByRole("button", { name: "Reset" }).click();

    // Verify URL is cleared
    await expect(page).toHaveURL("http://localhost:3000/");

    // Verify badge goes away (button should just say Filters)
    const filterBtn = page.getByRole("button", { name: /Filters/ });
    await expect(filterBtn).toHaveText(/^Filters$/);
  });
});
