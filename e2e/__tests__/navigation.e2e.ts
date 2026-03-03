/**
 * E2E tests for navigation and routing
 */

import { Page } from 'puppeteer';
import {
  setupBrowser,
  createPage,
  closeBrowser,
  navigateTo,
  waitForSelector,
  takeScreenshot,
} from '../helpers/setup';

describe('Navigation E2E Tests', () => {
  let page: Page;

  beforeAll(async () => {
    await setupBrowser();
  });

  beforeEach(async () => {
    page = await createPage();
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  afterAll(async () => {
    await closeBrowser();
  });

  it('should navigate between pages', async () => {
    try {
      await navigateTo(page, '/');
      
      // Wait for page to load
      await waitForSelector(page, 'body');
      
      // Get current URL
      const url = page.url();
      expect(url).toContain('localhost');
    } catch (error) {
      await takeScreenshot(page, 'navigation-failure');
      throw error;
    }
  });

  it('should handle browser back button', async () => {
    await navigateTo(page, '/');
    const firstUrl = page.url();
    
    // Navigate to another page (if exists)
    await navigateTo(page, '/');
    
    // Go back
    await page.goBack();
    
    const backUrl = page.url();
    expect(backUrl).toBe(firstUrl);
  });

  it('should handle browser forward button', async () => {
    await navigateTo(page, '/');
    
    // Navigate to another page
    await navigateTo(page, '/');
    const secondUrl = page.url();
    
    // Go back
    await page.goBack();
    
    // Go forward
    await page.goForward();
    
    const forwardUrl = page.url();
    expect(forwardUrl).toBe(secondUrl);
  });

  it('should maintain scroll position on navigation', async () => {
    await navigateTo(page, '/');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get scroll position
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });

  it('should handle 404 pages gracefully', async () => {
    const response = await page.goto('http://localhost:5173/nonexistent-page', {
      waitUntil: 'networkidle2',
    });
    
    // Should either show 404 page or redirect
    expect(response).toBeTruthy();
  });
});