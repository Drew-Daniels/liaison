import { test, expect } from "@playwright/test";

test.describe("iframe-react-app", () => {
  test("should display default login status", async ({ page }) => {
    await page.goto(process.env.BASE_URL || "http://localhost:4201");
    await expect(page.locator("text=Logged Out")).toBeVisible();
  });
});
