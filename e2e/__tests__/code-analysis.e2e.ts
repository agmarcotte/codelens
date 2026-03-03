/**
 * E2E tests for code analysis workflow
 */

import { Page } from 'puppeteer';
import {
  setupBrowser,
  createPage,
  closeBrowser,
  navigateTo,
  waitForSelector,
  takeScreenshot,
  typeText,
} from '../helpers/setup';

describe('Code Analysis E2E Tests', () => {
  let page: Page;

  beforeAll(async () => {
    await setupBrowser();
  });

  beforeEach(async () => {
    page = await createPage();
    await navigateTo(page, '/');
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  afterAll(async () => {
    await closeBrowser();
  });

  it('should display the analyze view by default', async () => {
    try {
      await waitForSelector(page, 'h2');
      
      const heading = await page.$eval('h2', (el) => el.textContent);
      expect(heading).toContain('Code Analysis');
    } catch (error) {
      await takeScreenshot(page, 'analyze-view-failure');
      throw error;
    }
  });

  it('should have file path input field', async () => {
    await waitForSelector(page, 'input[type="text"]');
    
    const input = await page.$('input[type="text"]');
    expect(input).toBeTruthy();
    
    const placeholder = await page.$eval(
      'input[type="text"]',
      (el) => el.getAttribute('placeholder')
    );
    expect(placeholder).toContain('src');
  });

  it('should have directory checkbox', async () => {
    await waitForSelector(page, 'input[type="checkbox"]');
    
    const checkbox = await page.$('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
  });

  it('should have analyze button', async () => {
    await waitForSelector(page, 'button');
    
    const buttons = await page.$$('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    const analyzeButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => btn.textContent?.includes('Analyze'));
    });
    
    expect(analyzeButton).toBe(true);
  });

  it('should show error when analyzing without file path', async () => {
    try {
      // Find and click the Analyze button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const analyzeBtn = buttons.find(btn => btn.textContent?.includes('Analyze'));
        if (analyzeBtn) {
          (analyzeBtn as HTMLButtonElement).click();
        }
      });
      
      // Wait for error message
      await page.waitForFunction(
        () => document.body.textContent?.includes('Please enter'),
        { timeout: 3000 }
      );
      
      const bodyText = await page.evaluate(() => document.body.textContent);
      expect(bodyText).toContain('Please enter');
    } catch (error) {
      await takeScreenshot(page, 'analyze-error-failure');
      throw error;
    }
  });

  it('should allow typing in file path input', async () => {
    const inputSelector = 'input[type="text"]';
    await waitForSelector(page, inputSelector);
    
    await typeText(page, inputSelector, './src/test.ts');
    
    const value = await page.$eval(
      inputSelector,
      (el) => (el as HTMLInputElement).value
    );
    
    expect(value).toBe('./src/test.ts');
  });

  it('should toggle directory checkbox', async () => {
    const checkboxSelector = 'input[type="checkbox"]';
    await waitForSelector(page, checkboxSelector);
    
    // Check initial state
    const initialChecked = await page.$eval(
      checkboxSelector,
      (el) => (el as HTMLInputElement).checked
    );
    expect(initialChecked).toBe(false);
    
    // Click checkbox
    await page.click(checkboxSelector);
    
    // Check new state
    const newChecked = await page.$eval(
      checkboxSelector,
      (el) => (el as HTMLInputElement).checked
    );
    expect(newChecked).toBe(true);
  });

  it('should have proper page structure', async () => {
    // Check for main content area
    await waitForSelector(page, 'main');
    
    const main = await page.$('main');
    expect(main).toBeTruthy();
    
    // Check for header
    const header = await page.$('header');
    expect(header).toBeTruthy();
  });

  it('should be responsive', async () => {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle2' });
    
    await waitForSelector(page, 'body');
    
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toContain('Code Analysis');
    
    // Reset viewport
    await page.setViewport({ width: 1280, height: 720 });
  });
});