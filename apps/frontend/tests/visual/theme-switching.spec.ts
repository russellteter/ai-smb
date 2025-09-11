import { test, expect, Page } from '@playwright/test';

test.describe('Theme Switching Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('captures light theme appearance', async ({ page }) => {
    // Ensure light theme is active
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    
    await page.waitForTimeout(500);
    
    // Full page screenshot in light mode
    await page.screenshot({
      path: 'tests/screenshots/theme-light-full.png',
      fullPage: true
    });
    
    // Capture specific components in light mode
    const header = page.locator('header').first();
    await header.screenshot({
      path: 'tests/screenshots/theme-light-header.png'
    });
    
    const glassCard = page.locator('.glass-card').first();
    if (await glassCard.count() > 0) {
      await glassCard.screenshot({
        path: 'tests/screenshots/theme-light-glass-card.png'
      });
    }
    
    // Verify light theme colors
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    console.log('Light theme background:', bgColor);
    expect(bgColor).toMatch(/rgb\(25[0-5], 25[0-5], 25[0-5]\)|white|#fff/i);
  });

  test('captures dark theme appearance', async ({ page }) => {
    // Switch to dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    
    await page.waitForTimeout(500);
    
    // Full page screenshot in dark mode
    await page.screenshot({
      path: 'tests/screenshots/theme-dark-full.png',
      fullPage: true
    });
    
    // Capture specific components in dark mode
    const header = page.locator('header').first();
    await header.screenshot({
      path: 'tests/screenshots/theme-dark-header.png'
    });
    
    const glassCard = page.locator('.glass-card').first();
    if (await glassCard.count() > 0) {
      await glassCard.screenshot({
        path: 'tests/screenshots/theme-dark-glass-card.png'
      });
    }
    
    // Verify dark theme colors
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    console.log('Dark theme background:', bgColor);
    expect(bgColor).toMatch(/rgb\(0|1[0-9]|2[0-9]|3[0-9], /);
  });

  test('toggles theme using UI button', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button:has([data-icon="sun"]), button:has([data-icon="moon"])').first();
    
    if (await themeToggle.count() > 0) {
      // Start in light mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
      });
      
      // Screenshot before toggle
      await page.screenshot({
        path: 'tests/screenshots/theme-before-toggle.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 200 }
      });
      
      // Click theme toggle
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Screenshot after toggle
      await page.screenshot({
        path: 'tests/screenshots/theme-after-toggle.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 200 }
      });
      
      // Verify theme changed
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });
      
      expect(isDark).toBe(true);
      
      // Toggle back
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      const isLight = await page.evaluate(() => {
        return !document.documentElement.classList.contains('dark');
      });
      
      expect(isLight).toBe(true);
    }
  });

  test('compares theme transitions', async ({ page }) => {
    // Capture transition animation frames
    const frames = [];
    
    // Start in light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    
    // Prepare to capture transition
    const captureArea = { x: 0, y: 0, width: 1920, height: 600 };
    
    // Trigger theme change and capture frames
    await page.evaluate(() => {
      document.documentElement.style.transition = 'all 0.5s ease';
      document.documentElement.classList.add('dark');
    });
    
    // Capture multiple frames during transition
    for (let i = 0; i < 5; i++) {
      await page.screenshot({
        path: `tests/screenshots/theme-transition-${i}.png`,
        fullPage: false,
        clip: captureArea
      });
      await page.waitForTimeout(100);
    }
  });

  test('analyzes theme color contrasts', async ({ page }) => {
    const themes = ['light', 'dark'];
    
    for (const theme of themes) {
      // Set theme
      await page.evaluate((t) => {
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, theme);
      
      await page.waitForTimeout(500);
      
      // Analyze color contrasts
      const contrasts = await page.evaluate(() => {
        const getContrastRatio = (rgb1: string, rgb2: string) => {
          // Simple contrast calculation (not WCAG compliant, just for demo)
          const getLuminance = (rgb: string) => {
            const matches = rgb.match(/\d+/g);
            if (!matches) return 0;
            const [r, g, b] = matches.map(Number);
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          };
          
          const l1 = getLuminance(rgb1);
          const l2 = getLuminance(rgb2);
          const lighter = Math.max(l1, l2);
          const darker = Math.min(l1, l2);
          
          return (lighter + 0.05) / (darker + 0.05);
        };
        
        const body = document.body;
        const heading = document.querySelector('h1');
        const button = document.querySelector('button');
        
        const bodyBg = window.getComputedStyle(body).backgroundColor;
        const bodyText = window.getComputedStyle(body).color;
        const headingColor = heading ? window.getComputedStyle(heading).color : '';
        const buttonBg = button ? window.getComputedStyle(button).backgroundColor : '';
        const buttonText = button ? window.getComputedStyle(button).color : '';
        
        return {
          bodyContrast: getContrastRatio(bodyBg, bodyText),
          headingContrast: heading ? getContrastRatio(bodyBg, headingColor) : 0,
          buttonContrast: button ? getContrastRatio(buttonBg, buttonText) : 0,
          colors: {
            bodyBg,
            bodyText,
            headingColor,
            buttonBg,
            buttonText
          }
        };
      });
      
      console.log(`${theme} theme contrasts:`, contrasts);
      
      // Screenshot for visual comparison
      await page.screenshot({
        path: `tests/screenshots/theme-${theme}-contrast-analysis.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 800 }
      });
      
      // Basic contrast checks (WCAG AA requires 4.5:1 for normal text)
      expect(contrasts.bodyContrast).toBeGreaterThan(3);
    }
  });

  test('checks theme persistence across navigation', async ({ page }) => {
    // Set dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check theme persisted
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(isDark).toBe(true);
    
    // Screenshot to verify
    await page.screenshot({
      path: 'tests/screenshots/theme-persistence-check.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 600 }
    });
  });

  test('captures theme-specific component variations', async ({ page }) => {
    const components = [
      { selector: '.stats-card', name: 'stats-card' },
      { selector: '.progress-chart', name: 'progress-chart' },
      { selector: 'button', name: 'button' },
      { selector: 'input', name: 'input' },
      { selector: 'table', name: 'table' }
    ];
    
    for (const theme of ['light', 'dark']) {
      // Set theme
      await page.evaluate((t) => {
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, theme);
      
      await page.waitForTimeout(300);
      
      // Capture each component
      for (const component of components) {
        const element = page.locator(component.selector).first();
        if (await element.count() > 0) {
          await element.screenshot({
            path: `tests/screenshots/theme-${theme}-${component.name}.png`
          });
        }
      }
    }
  });
});