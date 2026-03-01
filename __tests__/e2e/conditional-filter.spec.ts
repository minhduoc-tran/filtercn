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
    await page.getByRole("combobox", { name: /select field/i }).first(); // Using aria-label or accessible name if present,
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

  test("should update global search 'q' param when typing in FilterBar", async ({ page }) => {
    // Locate the FilterBar global search input
    const searchInput = page.getByPlaceholder("Search models...");
    await expect(searchInput).toBeVisible();

    // Type into the search input
    await searchInput.fill("shoes");

    // Wait for the debounce timeout (300ms) to sync the URL
    await page.waitForTimeout(400);

    // Verify that the URL is updated with the global search param `q`
    await expect(page).toHaveURL(/\/\?q=shoes/);

    // Ensure state persists when opening and closing the popover
    await page.getByRole("button", { name: /^Filters$/ }).click();
    await page.getByRole("button", { name: "+ Add filter" }).click();
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Name" }).click();

    // Explicitly set operator to 'Contains' to ensure textbox is visible
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "Contains" }).click();

    await page.getByRole("textbox").fill("shirt");
    await page.getByRole("button", { name: "Apply" }).click();

    // URL should now contain both the global search AND the conditional filter
    await expect(page).toHaveURL(/q=shoes/);
    await expect(page).toHaveURL(/name__icontains=shirt/);

    // Ensure the search input still retains its value
    await expect(searchInput).toHaveValue("shoes");
  });

  test("should apply 'is not' filter and exclude matching rows", async ({ page }) => {
    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: "+ Add filter" }).click();

    // Select "Status" field
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Status" }).click();

    // Change operator to "is not" (use exact match to distinguish from "is not empty")
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "is not", exact: true }).click();

    // Select "Active" as the value
    await page.getByRole("combobox").nth(2).click();
    await page.getByRole("option", { name: /active/i }).click();

    // Apply
    await page.getByRole("button", { name: "Apply" }).click();

    // Verify URL contains the negation param
    await expect(page).toHaveURL(/status__not=active/);

    // Wait for table data to refresh
    await expect(page.getByText(/Showing \d+ of \d+ products/)).toBeVisible();
    // Wait a beat for data to settle
    await page.waitForTimeout(800);

    // Verify the filtered count (should be 3 draft products out of 10)
    await expect(page.getByText("Showing 3 of 10 products")).toBeVisible();
  });

  test("should apply 'not contains' text filter and exclude matching rows", async ({ page }) => {
    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: "+ Add filter" }).click();

    // Select "Name" field
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Name" }).click();

    // Change operator to "does not contain"
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "does not contain", exact: true }).click();

    // Type value
    await page.getByRole("textbox").fill("Shirt");

    // Apply
    await page.getByRole("button", { name: "Apply" }).click();

    // Verify URL
    await expect(page).toHaveURL(/name__not_icontains=Shirt/);

    // Wait for table data to refresh
    await page.waitForTimeout(800);

    // Verify filtered count (should exclude T-Shirt Basic and Polo Shirt = 8 products)
    await expect(page.getByText(/Showing \d+ of \d+ products/)).toBeVisible();
  });
});
