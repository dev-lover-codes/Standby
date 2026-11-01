import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
}

test.describe("Standby pages", () => {
  test("landing shows the tagline and the four Challenge 5 features", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Standby.");
    await expect(page.locator("h1")).toContainText("Your event is rehearsed.");
    const sub = page.locator(".hero p");
    for (const word of ["Budget", "timeline", "vendor checklist", "personalized ideas"]) {
      await expect(sub).toContainText(word);
    }
    await expect(page.locator(".frame")).not.toHaveClass(/intro/, { timeout: 6000 });
    await expectNoAxeViolations(page);
  });

  test("landing does not scroll", async ({ page }) => {
    await page.goto("/");
    const [scrollH, viewH] = await page.evaluate(() => [document.documentElement.scrollHeight, innerHeight]);
    expect(scrollH).toBeLessThanOrEqual(viewH);
  });

  test("phone menu opens, closes with Escape, and updates its label", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#menu-sheet")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });

  test("skip link targets main content", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator(".skip-to-content")).toHaveAttribute("href", "#main-content");
    await expect(page.locator("#main-content")).toBeAttached();
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Sign in to Standby");
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test("protected pages send signed-out visitors to sign in", async ({ page }) => {
    await page.goto("/events/new");
    await expect(page).toHaveURL(/\/login\?next=%2Fevents%2Fnew/);
  });

  test("expired share link explains what to do next", async ({ page }) => {
    await page.goto("/share/not-a-real-token");
    await expect(page.locator("h1")).toContainText("This share link does not work");
    await expectNoAxeViolations(page);
  });

  test("security headers are set", async ({ request }) => {
    const res = await request.get("/");
    const csp = res.headers()["content-security-policy"] ?? "";
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-eval");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });
});
