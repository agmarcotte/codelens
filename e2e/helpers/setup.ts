/**
 * E2E test setup utilities
 */

import puppeteer, { Browser, Page } from 'puppeteer';

export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
export const API_URL = process.env.E2E_API_URL || 'http://localhost:3000';

let browser: Browser | null = null;

/**
 * Launch browser for E2E tests
 */
export async function setupBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browser;
}

/**
 * Create a new page with common setup
 */
export async function createPage(): Promise<Page> {
  const browserInstance = await setupBrowser();
  const page = await browserInstance.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  // Set default timeout
  page.setDefaultTimeout(10000);
  
  return page;
}

/**
 * Close browser
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForNetworkIdle({ timeout });
}

/**
 * Take screenshot on failure
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `e2e/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Navigate to URL and wait for load
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  await page.goto(`${BASE_URL}${path}`, {
    waitUntil: 'networkidle2',
  });
}

/**
 * Wait for selector with retry
 */
export async function waitForSelector(
  page: Page,
  selector: string,
  options?: { timeout?: number; visible?: boolean }
): Promise<void> {
  await page.waitForSelector(selector, {
    timeout: options?.timeout || 5000,
    visible: options?.visible !== false,
  });
}

/**
 * Type text with delay
 */
export async function typeText(page: Page, selector: string, text: string): Promise<void> {
  await page.type(selector, text, { delay: 50 });
}

/**
 * Click element and wait for navigation
 */
export async function clickAndWait(page: Page, selector: string): Promise<void> {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click(selector),
  ]);
}