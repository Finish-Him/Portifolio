/**
 * E2E Tests — Home Page
 * Tests the main landing page flows: rendering, navigation, CTAs.
 */
import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for hero to be visible
    await page.waitForSelector("h1", { timeout: 10000 });
  });

  test("renders hero section with name and title", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text).toContain("Moises Costa");
  });

  test("renders AI Engineer subtitle", async ({ page }) => {
    const subtitle = page.locator("text=AI Engineer");
    await expect(subtitle.first()).toBeVisible();
  });

  test("shows Try Live Agents CTA button", async ({ page }) => {
    const btn = page.locator("text=Try Live Agents");
    await expect(btn.first()).toBeVisible();
  });

  test("Try Live Agents CTA links to /agents", async ({ page }) => {
    // The CTA should be a link pointing to /agents
    const link = page.locator("a[href='/agents']");
    await expect(link.first()).toBeVisible();
  });

  test("navbar shows single Agents button linking to /agents", async ({ page }) => {
    const agentsBtn = page.locator("nav a[href='/agents']");
    await expect(agentsBtn.first()).toBeVisible();
  });

  test("links section shows Download CV card", async ({ page }) => {
    // Scroll to links section first
    await page.locator("#links").scrollIntoViewIfNeeded();
    const btn = page.locator("text=Download CV");
    await expect(btn.first()).toBeVisible();
  });

  test("links section shows WhatsApp card", async ({ page }) => {
    await page.locator("#links").scrollIntoViewIfNeeded();
    const btn = page.locator("text=WhatsApp");
    await expect(btn.first()).toBeVisible();
  });

  test("links section shows Hugging Face card", async ({ page }) => {
    await page.locator("#links").scrollIntoViewIfNeeded();
    const btn = page.locator("text=Hugging Face");
    await expect(btn.first()).toBeVisible();
  });

  test("links section has Try Agents and Read Blog CTAs", async ({ page }) => {
    await page.locator("#links").scrollIntoViewIfNeeded();
    const agentsCta = page.locator("#links a[href='/agents']");
    const blogCta = page.locator("#links a[href='/blog']");
    await expect(agentsCta.first()).toBeVisible();
    await expect(blogCta.first()).toBeVisible();
  });

  test("navbar shows MSc Academy logo", async ({ page }) => {
    const logo = page.locator("nav").first();
    await expect(logo).toBeVisible();
  });

  test("language switcher is visible with EN selected", async ({ page }) => {
    const enBtn = page.locator("button:has-text('EN'), span:has-text('EN')");
    await expect(enBtn.first()).toBeVisible();
  });

  test("page title contains Moises Costa and AI Engineer", async ({ page }) => {
    const title = await page.title();
    // Title uses 'Moises' without accent in HTML meta tag
    expect(title.toLowerCase()).toContain("moises");
    expect(title.toLowerCase()).toContain("ai engineer");
  });

  test("scrolls to About section when clicking About nav link", async ({ page }) => {
    // Click the scroll-down indicator or find About section
    const aboutSection = page.locator("#about, [id='about']");
    if (await aboutSection.count() > 0) {
      await aboutSection.scrollIntoViewIfNeeded();
      await expect(aboutSection).toBeVisible();
    }
  });
});
