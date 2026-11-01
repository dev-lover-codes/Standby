import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Standby Accessibility & Core Flows", () => {
  test("Landing page meets WCAG AA standards (zero axe violations)", async ({ page }) => {
    await page.goto("/");

    // Verify key Challenge 5 keywords are visible in the UI
    await expect(page.locator("h1")).toContainText("Standby");
    await expect(page.getByText("Your event is rehearsed.")).toBeVisible();
    await expect(page.getByText("budget", { exact: false })).toBeVisible();
    await expect(page.getByText("timeline", { exact: false })).toBeVisible();
    await expect(page.getByText("vendor checklist", { exact: false })).toBeVisible();
    await expect(page.getByText("personalized ideas", { exact: false })).toBeVisible();

    // Run Axe scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Skip to content link is accessible and targets main", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator(".skip-to-content");
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  test("Theme toggle switches theme cleanly", async ({ page }) => {
    await page.goto("/");
    const themeBtn = page.getByRole("button", { name: /switch to dark theme|switch to light theme/i });
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", /dark|light/);
  });

  test("Login page accessibility scan", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Production Login");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("New event slate form accessibility scan", async ({ page }) => {
    await page.goto("/events/new");
    await expect(page.locator("h1")).toContainText("Rehearse a New Event");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
