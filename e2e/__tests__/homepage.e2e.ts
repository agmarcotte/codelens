/**
 * E2E tests for homepage
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

describe('Homepage E2E Tests', () => {
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

  it('should load the homepage successfully', async () => {
    try {
      await navigateTo(page, '/');
      
      // Check if page title is correct
      const title = await page.title();
      expect(title).toContain('CodeLens');
      
      // Check if main content is visible
      await waitForSelector(page, 'body');
      
      const bodyText = await page.evaluate(() => document.body.textContent);
      expect(bodyText).toBeTruthy();
    } catch (error) {
      await takeScreenshot(page, 'homepage-load-failure');
      throw error;
    }
  });

  it('should have proper meta tags', async () => {
    await navigateTo(page, '/');
    
    const metaDescription = await page.$eval(
      'meta[name="description"]',
      (el) => el.getAttribute('content')
    );
    
    expect(metaDescription).toBeTruthy();
  });

  it('should have responsive viewport', async () => {
    await navigateTo(page, '/');
    
    const viewport = await page.$eval(
      'meta[name="viewport"]',
      (el) => el.getAttribute('content')
    );
    
    expect(viewport).toContain('width=device-width');
  });

  it('should load without console errors', async () => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await navigateTo(page, '/');
    
    // Wait a bit for any async errors
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    expect(consoleErrors).toHaveLength(0);
  });

  it('should have proper accessibility attributes', async () => {
    await navigateTo(page, '/');
    
    // Check for lang attribute
    const htmlLang = await page.$eval('html', (el) => el.getAttribute('lang'));
    expect(htmlLang).toBeTruthy();
  });
});