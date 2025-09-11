import { test, expect } from '@playwright/test';

test('quick visual test', async ({ page }) => {
  // Navigate to homepage
  await page.goto('/');
  
  // Take a screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/quick-test.png',
    fullPage: true 
  });
  
  // Verify page loaded
  await expect(page).toHaveTitle(/Mothership/i);
  
  console.log('✅ Playwright is working! Screenshot saved to tests/screenshots/quick-test.png');
});