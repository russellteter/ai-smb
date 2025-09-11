import { test, expect, devices } from '@playwright/test';

const mobileDevices = [
  { name: 'iPhone 13', device: devices['iPhone 13'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'iPad', device: devices['iPad (gen 7)'] },
  { name: 'Galaxy S21', device: devices['Galaxy S21'] }
];

test.describe('Mobile Responsive Visual Tests', () => {
  mobileDevices.forEach(({ name, device }) => {
    test.describe(`${name} View`, () => {
      test.use(device);
      
      test('captures mobile homepage layout', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Full page screenshot
        await page.screenshot({
          path: `tests/screenshots/mobile-${name.toLowerCase().replace(/ /g, '-')}-homepage.png`,
          fullPage: true
        });
        
        // Check mobile menu is visible
        const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"]');
        if (await mobileMenu.count() > 0) {
          expect(await mobileMenu.isVisible()).toBe(true);
        }
      });
      
      test('tests mobile navigation', async ({ page }) => {
        await page.goto('/');
        
        // Look for hamburger menu
        const menuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu-button"]').first();
        
        if (await menuButton.count() > 0) {
          // Screenshot before opening menu
          await page.screenshot({
            path: `tests/screenshots/mobile-${name.toLowerCase().replace(/ /g, '-')}-menu-closed.png`,
            fullPage: false,
            clip: { x: 0, y: 0, width: device.viewport.width, height: 200 }
          });
          
          // Open mobile menu
          await menuButton.click();
          await page.waitForTimeout(300);
          
          // Screenshot with menu open
          await page.screenshot({
            path: `tests/screenshots/mobile-${name.toLowerCase().replace(/ /g, '-')}-menu-open.png`,
            fullPage: true
          });
          
          // Check menu items
          const menuItems = page.locator('nav a, [role="menuitem"]');
          const itemCount = await menuItems.count();
          expect(itemCount).toBeGreaterThan(0);
        }
      });
      
      test('checks mobile card layouts', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);
        
        // Check for mobile-specific card layouts
        const cards = page.locator('.glass-card, [data-testid="mobile-card"]');
        
        if (await cards.count() > 0) {
          // Screenshot card section
          await page.screenshot({
            path: `tests/screenshots/mobile-${name.toLowerCase().replace(/ /g, '-')}-cards.png`,
            fullPage: true
          });
          
          // Check cards are stacked vertically on mobile
          const firstCard = cards.first();
          const secondCard = cards.nth(1);
          
          if (await secondCard.count() > 0) {
            const firstBox = await firstCard.boundingBox();
            const secondBox = await secondCard.boundingBox();
            
            if (firstBox && secondBox) {
              // Cards should be stacked (second card Y should be greater than first)
              expect(secondBox.y).toBeGreaterThan(firstBox.y);
              console.log(`${name} card stacking:`, {
                firstY: firstBox.y,
                secondY: secondBox.y,
                stacked: secondBox.y > firstBox.y
              });
            }
          }
        }
      });
      
      test('tests touch interactions', async ({ page }) => {
        await page.goto('/');
        
        // Find swipeable elements
        const swipeableCards = page.locator('[data-testid="swipeable"], .swipe-card');
        
        if (await swipeableCards.count() > 0) {
          const card = swipeableCards.first();
          const box = await card.boundingBox();
          
          if (box) {
            // Simulate swipe gesture
            await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
            
            // Screenshot after tap
            await page.screenshot({
              path: `tests/screenshots/mobile-${name.toLowerCase().replace(/ /g, '-')}-touch-interaction.png`,
              fullPage: false,
              clip: { x: 0, y: box.y - 50, width: device.viewport.width, height: box.height + 100 }
            });
          }
        }
      });
    });
  });
  
  test.describe('Responsive Breakpoint Tests', () => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop-sm', width: 1024, height: 768 },
      { name: 'desktop-md', width: 1440, height: 900 },
      { name: 'desktop-lg', width: 1920, height: 1080 },
      { name: 'desktop-xl', width: 2560, height: 1440 }
    ];
    
    breakpoints.forEach(({ name, width, height }) => {
      test(`captures layout at ${name} breakpoint (${width}x${height})`, async ({ page }) => {
        // Set specific viewport
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Full page screenshot at this breakpoint
        await page.screenshot({
          path: `tests/screenshots/breakpoint-${name}-${width}x${height}.png`,
          fullPage: true
        });
        
        // Analyze layout properties
        const layoutAnalysis = await page.evaluate(() => {
          const container = document.querySelector('main, .container');
          const header = document.querySelector('header');
          const nav = document.querySelector('nav');
          
          return {
            containerWidth: container ? container.clientWidth : 0,
            headerHeight: header ? header.clientHeight : 0,
            navVisible: nav ? window.getComputedStyle(nav).display !== 'none' : false,
            fontSize: window.getComputedStyle(document.body).fontSize,
            columns: document.querySelectorAll('.grid > *, .flex > *').length
          };
        });
        
        console.log(`${name} layout analysis:`, layoutAnalysis);
        
        // Check responsive behavior
        if (width < 768) {
          // Mobile checks
          const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"]');
          expect(await mobileMenu.count()).toBeGreaterThan(0);
        } else {
          // Desktop checks
          const desktopNav = page.locator('nav:not([data-mobile])');
          if (await desktopNav.count() > 0) {
            expect(await desktopNav.isVisible()).toBe(true);
          }
        }
      });
    });
  });
  
  test.describe('Orientation Tests', () => {
    test('landscape orientation on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 13'],
        viewport: { width: 844, height: 390 } // Landscape iPhone 13
      });
      
      const page = await context.newPage();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'tests/screenshots/mobile-landscape.png',
        fullPage: true
      });
      
      // Check if layout adapts to landscape
      const isLandscapeOptimized = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? main.clientHeight < window.innerHeight * 1.5 : false;
      });
      
      console.log('Landscape optimized:', isLandscapeOptimized);
      
      await context.close();
    });
    
    test('portrait orientation on tablet', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad (gen 7)'],
        viewport: { width: 810, height: 1080 } // Portrait iPad
      });
      
      const page = await context.newPage();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'tests/screenshots/tablet-portrait.png',
        fullPage: true
      });
      
      await context.close();
    });
  });
  
  test('mobile-specific features', async ({ browser }) => {
    const context = await browser.newContext(devices['iPhone 13']);
    const page = await context.newPage();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for mobile-specific components
    const mobileFeatures = await page.evaluate(() => {
      return {
        hasBottomNav: !!document.querySelector('[data-testid="bottom-nav"], .bottom-navigation'),
        hasSwipeCards: !!document.querySelector('[data-swipeable], .swipe-card'),
        hasMobileSearch: !!document.querySelector('[data-testid="mobile-search"], .mobile-search'),
        hasPullToRefresh: !!document.querySelector('[data-pull-refresh]'),
        hasFloatingActionButton: !!document.querySelector('[data-testid="fab"], .floating-action-button')
      };
    });
    
    console.log('Mobile-specific features:', mobileFeatures);
    
    // Screenshot mobile-specific UI elements
    if (mobileFeatures.hasBottomNav) {
      const bottomNav = page.locator('[data-testid="bottom-nav"], .bottom-navigation');
      await bottomNav.screenshot({
        path: 'tests/screenshots/mobile-bottom-nav.png'
      });
    }
    
    if (mobileFeatures.hasFloatingActionButton) {
      const fab = page.locator('[data-testid="fab"], .floating-action-button');
      await fab.screenshot({
        path: 'tests/screenshots/mobile-fab.png'
      });
    }
    
    await context.close();
  });
});