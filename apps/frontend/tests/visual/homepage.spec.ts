import { test, expect, Page } from '@playwright/test';

test.describe('Homepage Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for animations to complete
    await page.waitForTimeout(1000);
  });

  test('captures full homepage dashboard', async ({ page }) => {
    // Wait for all content to load
    await page.waitForSelector('[data-testid="stats-grid"], .glass-card', { timeout: 10000 });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/homepage-full.png',
      fullPage: true,
      animations: 'disabled'
    });
    
    // Visual regression test
    await expect(page).toHaveScreenshot('homepage-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('[data-testid="live-timestamp"]')] // Mask dynamic content
    });
  });

  test('captures hero section with gradient effects', async ({ page }) => {
    const heroSection = page.locator('main > div > div').first();
    
    // Capture hero section
    await heroSection.screenshot({
      path: 'tests/screenshots/hero-section.png'
    });
    
    // Check gradient text is visible
    await expect(page.locator('h1')).toContainText('AI-Powered Lead Discovery');
    
    // Verify glass morphism effects
    const glassCard = page.locator('.glass-card').first();
    await expect(glassCard).toBeVisible();
  });

  test('captures stats grid with all metrics', async ({ page }) => {
    // Wait for stats to load
    const statsGrid = page.locator('[data-testid="stats-grid"], div:has(> div > div > div > p:text("Active Searches"))').first();
    
    if (await statsGrid.count() > 0) {
      await statsGrid.screenshot({
        path: 'tests/screenshots/stats-grid.png'
      });
      
      // Verify all stat cards are present
      await expect(page.locator('text="Active Searches"')).toBeVisible();
      await expect(page.locator('text="Leads Found"')).toBeVisible();
      await expect(page.locator('text="Avg Score"')).toBeVisible();
      await expect(page.locator('text="Conversion Rate"')).toBeVisible();
    }
  });

  test('captures search section interface', async ({ page }) => {
    const searchSection = page.locator('.glass-card:has(h2:text("Start New Search"))');
    
    if (await searchSection.count() > 0) {
      await searchSection.screenshot({
        path: 'tests/screenshots/search-section.png'
      });
      
      // Verify search elements
      await expect(page.locator('h2:text("Start New Search")')).toBeVisible();
      await expect(page.locator('text="Describe your ideal customer"')).toBeVisible();
    }
  });

  test('analyzes color scheme and contrast', async ({ page }) => {
    // Get computed styles for analysis
    const styles = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyles = window.getComputedStyle(root);
      
      return {
        primaryColor: computedStyles.getPropertyValue('--primary'),
        backgroundColor: computedStyles.getPropertyValue('--background'),
        foregroundColor: computedStyles.getPropertyValue('--foreground'),
        cardColor: computedStyles.getPropertyValue('--card'),
        borderColor: computedStyles.getPropertyValue('--border'),
      };
    });
    
    console.log('Color Scheme Analysis:', styles);
    
    // Screenshot with specific color focus
    await page.screenshot({
      path: 'tests/screenshots/color-analysis.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
  });

  test('captures floating elements and animations', async ({ page }) => {
    // Wait for floating elements to render
    await page.waitForTimeout(2000);
    
    // Capture the animated background
    const animatedBg = page.locator('[data-testid="animated-gradient"], body').first();
    
    // Take multiple screenshots to capture animation states
    for (let i = 0; i < 3; i++) {
      await animatedBg.screenshot({
        path: `tests/screenshots/animation-frame-${i}.png`
      });
      await page.waitForTimeout(1000);
    }
  });

  test('measures performance metrics', async ({ page }) => {
    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
      };
    });
    
    console.log('Performance Metrics:', metrics);
    
    // Ensure page loads within acceptable time
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.firstContentfulPaint).toBeLessThan(2000);
  });

  test('checks accessibility basics', async ({ page }) => {
    // Run accessibility checks
    const accessibilityIssues = await page.evaluate(() => {
      const issues: string[] = [];
      
      // Check for alt text on images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          issues.push(`Image missing alt text: ${img.src}`);
        }
      });
      
      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        if (level - lastLevel > 1) {
          issues.push(`Heading hierarchy skip: ${heading.tagName} after H${lastLevel}`);
        }
        lastLevel = level;
      });
      
      // Check for proper button/link labels
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
          issues.push('Button missing label');
        }
      });
      
      return issues;
    });
    
    console.log('Accessibility Issues:', accessibilityIssues);
    
    // Screenshot for manual accessibility review
    await page.screenshot({
      path: 'tests/screenshots/accessibility-check.png',
      fullPage: true
    });
  });
});