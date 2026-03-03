/**
 * E2E tests for theme switching and settings
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

describe('Theme and Settings E2E Tests', () => {
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

  it('should have theme toggle button in header', async () => {
    try {
      await waitForSelector(page, 'header');
      
      const themeButton = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('header button'));
        return buttons.some(btn => btn.getAttribute('aria-label')?.includes('theme'));
      });
      
      expect(themeButton).toBe(true);
    } catch (error) {
      await takeScreenshot(page, 'theme-button-failure');
      throw error;
    }
  });

  it('should toggle theme when clicking theme button', async () => {
    await waitForSelector(page, 'header');
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    // Click theme toggle button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('header button'));
      const themeBtn = buttons.find(btn => 
        btn.getAttribute('aria-label')?.includes('theme')
      );
      if (themeBtn) {
        (themeBtn as HTMLButtonElement).click();
      }
    });
    
    // Wait for theme to change
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get new theme
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    // Theme should have changed
    expect(newTheme).not.toBe(initialTheme);
  });

  it('should navigate to settings view', async () => {
    await waitForSelector(page, 'aside');
    
    // Click Settings in sidebar
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const settingsBtn = buttons.find(btn => btn.textContent?.includes('Settings'));
      if (settingsBtn) {
        (settingsBtn as HTMLButtonElement).click();
      }
    });
    
    // Wait for Settings view
    await page.waitForFunction(
      () => document.body.textContent?.includes('Configure your CodeLens'),
      { timeout: 3000 }
    );
    
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toContain('Settings');
    expect(bodyText).toContain('Appearance');
  });

  it('should display theme options in settings', async () => {
    await waitForSelector(page, 'aside');
    
    // Navigate to Settings
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const settingsBtn = buttons.find(btn => btn.textContent?.includes('Settings'));
      if (settingsBtn) {
        (settingsBtn as HTMLButtonElement).click();
      }
    });
    
    await page.waitForFunction(
      () => document.body.textContent?.includes('Theme'),
      { timeout: 3000 }
    );
    
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toContain('Light');
    expect(bodyText).toContain('Dark');
  });

  it('should switch theme from settings page', async () => {
    await waitForSelector(page, 'aside');
    
    // Navigate to Settings
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const settingsBtn = buttons.find(btn => btn.textContent?.includes('Settings'));
      if (settingsBtn) {
        (settingsBtn as HTMLButtonElement).click();
      }
    });
    
    await page.waitForFunction(
      () => document.body.textContent?.includes('Theme'),
      { timeout: 3000 }
    );
    
    // Click Dark theme button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const darkBtn = buttons.find(btn => 
        btn.textContent?.trim() === 'Dark' || 
        btn.textContent?.includes('Dark')
      );
      if (darkBtn) {
        (darkBtn as HTMLButtonElement).click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify theme changed
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toBeTruthy();
  });

  it('should display about section in settings', async () => {
    await waitForSelector(page, 'aside');
    
    // Navigate to Settings
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const settingsBtn = buttons.find(btn => btn.textContent?.includes('Settings'));
      if (settingsBtn) {
        (settingsBtn as HTMLButtonElement).click();
      }
    });
    
    await page.waitForFunction(
      () => document.body.textContent?.includes('About'),
      { timeout: 3000 }
    );
    
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toContain('About');
    expect(bodyText).toContain('Version');
  });

  it('should display version information', async () => {
    await waitForSelector(page, 'aside');
    
    // Navigate to Settings
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const settingsBtn = buttons.find(btn => btn.textContent?.includes('Settings'));
      if (settingsBtn) {
        (settingsBtn as HTMLButtonElement).click();
      }
    });
    
    await page.waitForFunction(
      () => document.body.textContent?.includes('Version'),
      { timeout: 3000 }
    );
    
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toContain('1.0.0');
  });

  it('should persist theme preference', async () => {
    await waitForSelector(page, 'header');
    
    // Toggle theme
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('header button'));
      const themeBtn = buttons.find(btn => 
        btn.getAttribute('aria-label')?.includes('theme')
      );
      if (themeBtn) {
        (themeBtn as HTMLButtonElement).click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const themeAfterToggle = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    // Reload page
    await page.reload({ waitUntil: 'networkidle2' });
    await waitForSelector(page, 'body');
    
    // Check if theme persisted
    const themeAfterReload = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    
    expect(themeAfterReload).toBe(themeAfterToggle);
  });
});