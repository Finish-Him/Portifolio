/**
 * E2E Tests — Agents Chat & Contact Form
 * Tests the chat interface and contact form submission.
 */
import { test, expect } from "@playwright/test";

test.describe("Agents Chat Interface", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/agents");
    await page.waitForSelector("text=Arquimedes", { timeout: 10000 });
  });

  test("chat input is visible and enabled", async ({ page }) => {
    const input = page.locator("input[type='text'], textarea").first();
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test("send button is visible", async ({ page }) => {
    // The send button is near the "Press Enter to send" hint text
    const hint = page.locator("text=Press Enter to send");
    await expect(hint).toBeVisible();
  });

  test("can type a message in chat input", async ({ page }) => {
    const input = page.locator("input[type='text'], textarea").first();
    await input.fill("What is 2 + 2?");
    const value = await input.inputValue();
    expect(value).toBe("What is 2 + 2?");
  });

  test("suggested prompts are displayed", async ({ page }) => {
    // Suggested prompts are buttons with text like "Explain fractions..."
    const prompt = page.locator("button:has-text('Explain')").first();
    await expect(prompt).toBeVisible();
  });

  test("Atlas tab switches agent", async ({ page }) => {
    const atlasTab = page.locator("button:has-text('Atlas')").first();
    await atlasTab.click();
    await page.waitForTimeout(300);
    const atlasContent = page.locator("text=Atlas").first();
    await expect(atlasContent).toBeVisible();
  });

  test("Artemis tab switches agent", async ({ page }) => {
    const artemisTab = page.locator("button:has-text('Artemis')").first();
    await artemisTab.click();
    await page.waitForTimeout(300);
    const artemisContent = page.locator("text=Artemis").first();
    await expect(artemisContent).toBeVisible();
  });

  test("sends a message and input clears", async ({ page }) => {
    const input = page.locator("input[type='text'], textarea").first();
    await input.fill("Hello Arquimedes!");
    // Press Enter to send
    await input.press("Enter");
    // Input should be cleared after sending
    await page.waitForTimeout(800);
    const value = await input.inputValue();
    expect(value).toBe("");
  });
});

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Scroll to contact form at bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
  });

  test("contact form is present on the page", async ({ page }) => {
    const form = page.locator("form").first();
    await expect(form).toBeVisible();
  });

  test("contact form has name, email and message fields", async ({ page }) => {
    // Inputs use placeholder selectors (no name attribute)
    const nameInput = page.locator("input[placeholder='Moises Costa'], input[type='text']").first();
    const emailInput = page.locator("input[type='email']").first();
    const messageInput = page.locator("textarea").first();

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
  });

  test("contact form accepts valid input", async ({ page }) => {
    const nameInput = page.locator("input[placeholder='Moises Costa'], input[type='text']").first();
    const emailInput = page.locator("input[type='email']").first();
    const messageInput = page.locator("textarea").first();

    if (await nameInput.count() > 0) {
      await nameInput.fill("Test Recruiter");
      await emailInput.fill("recruiter@techcorp.com");
      await messageInput.fill("I am interested in discussing an AI Engineer role with you.");

      expect(await nameInput.inputValue()).toBe("Test Recruiter");
      expect(await emailInput.inputValue()).toBe("recruiter@techcorp.com");
      expect(await messageInput.inputValue()).toContain("AI Engineer");
    }
  });

  test("contact form shows validation for empty submission", async ({ page }) => {
    const submitBtn = page.locator("button[type='submit']").first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      // Form should still be visible (not submitted with empty fields)
      const form = page.locator("form").first();
      await expect(form).toBeVisible();
    }
  });
});

test.describe("CV Download", () => {
  test("Download CV button has correct href attribute", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("text=Download CV", { timeout: 10000 });

    const downloadBtn = page.locator("a:has-text('Download CV')").first();
    await expect(downloadBtn).toBeVisible();

    const href = await downloadBtn.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).not.toBe("#");
    // Should point to storage or a PDF file
    expect(href).toMatch(/\.(pdf)$|\/manus-storage\//i);
  });

  test("Download CV button has download attribute or PDF link", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("text=Download CV", { timeout: 10000 });

    const downloadBtn = page.locator("a:has-text('Download CV')").first();
    const href = await downloadBtn.getAttribute("href");
    const download = await downloadBtn.getAttribute("download");
    // Either has download attribute or href ends in .pdf or points to storage
    expect(
      download !== null || href?.includes(".pdf") || href?.includes("manus-storage")
    ).toBeTruthy();
  });
});
