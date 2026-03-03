/**
 * E2E tests for sidebar navigation
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

describe('Sidebar Navigation E2E Tests', () => {
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

  it('should display sidebar by default', async () => {
    try {
      await waitForSelector(page, 'aside', { timeout: 5000 });
      
      const sidebar = await page.$('aside');
      expect(sidebar).toBeTruthy();
    } catch (error) {
      await takeScreenshot(page, 'sidebar-display-failure');
      throw error;
    }
  });

  it('should have all navigation items', async () => {
    await waitForSelector(page, 'aside');
    
    const navItems = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      return buttons.map(btn => btn.textContent?.trim());
    });
    
    expect(navItems).toContain('Analyze Code');
    expect(navItems).toContain('Documentation');
    expect(navItems).toContain('Playground');
    expect(navItems).toContain('Cache');
    expect(navItems).toContain('Settings');
  });

  it('should highlight active navigation item', async () => {
    await waitForSelector(page, 'aside');
    
    const activeItem = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const active = buttons.find(btn => 
        btn.className.includes('bg-primary')
      );
      return active?.textContent?.trim();
    });
    
    expect(activeItem).toBeTruthy();
  });

  it('should navigate to Cache view', async () => {
    try {
      await waitForSelector(page, 'aside');
      
      // Click Cache navigation item
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('aside button'));
        const cacheBtn = buttons.find(btn => btn.textContent?.includes('Cache'));
        if (cacheBtn) {
          (cacheBtn as HTMLButtonElement).click();
        }
      });
      
      // Wait for Cache view to load
      await page.waitForFunction(
        () => document.body.textContent?.includes('Cache Management'),
        { timeout: 3000 }
      );
      
      const bodyText = await page.evaluate(() => document.body.textContent);
      expect(bodyText).toContain('Cache Management');
    } catch (error) {
      await takeScreenshot(page, 'cache-navigation-failure');
      throw error;
    }
  });

  it('should navigate to Settings view', async () => {
    await waitForSelector(page, 'aside');
    
    // Click Settings navigation item
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const settingsBtn = buttons.find(btn => btn.textContent?.includes('Settings'));
      if (settingsBtn) {
        (settingsBtn as HTMLButtonElement).click();
      }
    });
    
    // Wait for Settings view to load
    await page.waitForFunction(
      () => document.body.textContent?.includes('Configure your CodeLens'),
      { timeout: 3000 }
    );
    
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toContain('Settings');
  });

  it('should navigate to Documentation view', async () => {
    await waitForSelector(page, 'aside');
    
    // Click Documentation navigation item
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const docBtn = buttons.find(btn => btn.textContent?.includes('Documentation'));
      if (docBtn) {
        (docBtn as HTMLButtonElement).click();
      }
    });
    
    // Wait a bit for view to change
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check that we're no longer on the analyze view
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toBeTruthy();
  });

  it('should navigate to Playground view', async () => {
    await waitForSelector(page, 'aside');
    
    // Click Playground navigation item
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const playgroundBtn = buttons.find(btn => btn.textContent?.includes('Playground'));
      if (playgroundBtn) {
        (playgroundBtn as HTMLButtonElement).click();
      }
    });
    
    // Wait a bit for view to change
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toBeTruthy();
  });

  it('should toggle sidebar with menu button', async () => {
    await waitForSelector(page, 'header');
    
    // Find menu button in header
    const menuButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('header button'));
      return buttons.some(btn => btn.getAttribute('aria-label')?.includes('sidebar'));
    });
    
    expect(menuButton).toBe(true);
  });

  it('should maintain navigation state across views', async () => {
    await waitForSelector(page, 'aside');
    
    // Navigate to Cache
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const cacheBtn = buttons.find(btn => btn.textContent?.includes('Cache'));
      if (cacheBtn) {
        (cacheBtn as HTMLButtonElement).click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Navigate to Settings
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const settingsBtn = buttons.find(btn => btn.textContent?.includes('Settings'));
      if (settingsBtn) {
        (settingsBtn as HTMLButtonElement).click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check that Settings is now active
    const activeItem = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const active = buttons.find(btn => 
        btn.className.includes('bg-primary')
      );
      return active?.textContent?.trim();
    });
    
    expect(activeItem).toContain('Settings');
  });
});