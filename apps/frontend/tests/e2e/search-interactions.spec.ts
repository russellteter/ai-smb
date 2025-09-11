import { test, expect, Page } from '@playwright/test';

test.describe('Search Interface Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('performs natural language search', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="ideal customer"], textarea').first();
    
    // Type search query
    await searchInput.fill('Find me AI-ready SMBs in San Francisco with 10-50 employees');
    
    // Screenshot the filled search form
    await page.screenshot({
      path: 'tests/screenshots/search-input-filled.png',
      fullPage: false,
      clip: { x: 0, y: 200, width: 1920, height: 400 }
    });
    
    // Click search button
    const searchButton = page.locator('button:has-text("Search"), button:has-text("Start Search")').first();
    await searchButton.click();
    
    // Wait for streaming to start
    await page.waitForTimeout(1000);
    
    // Capture streaming state
    await page.screenshot({
      path: 'tests/screenshots/search-streaming.png',
      fullPage: true
    });
  });

  test('uses quick filter buttons', async ({ page }) => {
    // Look for quick filter section
    const quickFilters = page.locator('button:has-text("High Intent"), button:has-text("Tech Ready")');
    
    if (await quickFilters.count() > 0) {
      // Click first quick filter
      await quickFilters.first().click();
      
      // Screenshot with filter applied
      await page.screenshot({
        path: 'tests/screenshots/quick-filter-applied.png',
        fullPage: false,
        clip: { x: 0, y: 200, width: 1920, height: 600 }
      });
    }
  });

  test('opens and uses advanced filters', async ({ page }) => {
    // Look for advanced search or filter button
    const advancedButton = page.locator('button:has-text("Advanced"), button:has-text("Filters")').first();
    
    if (await advancedButton.count() > 0) {
      await advancedButton.click();
      await page.waitForTimeout(500);
      
      // Screenshot advanced filters panel
      await page.screenshot({
        path: 'tests/screenshots/advanced-filters-open.png',
        fullPage: true
      });
      
      // Try to interact with filter options
      const locationFilter = page.locator('input[placeholder*="location"], input[placeholder*="Location"]').first();
      if (await locationFilter.count() > 0) {
        await locationFilter.fill('California');
      }
      
      const industryFilter = page.locator('select:has-text("Industry"), input[placeholder*="industry"]').first();
      if (await industryFilter.count() > 0) {
        await industryFilter.click();
      }
      
      // Screenshot with filters filled
      await page.screenshot({
        path: 'tests/screenshots/advanced-filters-filled.png',
        fullPage: true
      });
    }
  });

  test('analyzes search suggestions', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="ideal customer"], textarea').first();
    
    // Start typing to trigger suggestions
    await searchInput.fill('Find me');
    await page.waitForTimeout(500);
    
    // Check for suggestions dropdown
    const suggestions = page.locator('[role="listbox"], .suggestions, .autocomplete');
    
    if (await suggestions.count() > 0) {
      await page.screenshot({
        path: 'tests/screenshots/search-suggestions.png',
        fullPage: false,
        clip: { x: 0, y: 200, width: 1920, height: 600 }
      });
    }
  });

  test('uses search templates', async ({ page }) => {
    // Look for template buttons
    const templates = page.locator('button:has-text("Template"), button:has-text("Example")');
    
    if (await templates.count() > 0) {
      // Screenshot templates section
      await page.screenshot({
        path: 'tests/screenshots/search-templates.png',
        fullPage: false,
        clip: { x: 0, y: 200, width: 1920, height: 800 }
      });
      
      // Click a template
      await templates.first().click();
      await page.waitForTimeout(500);
      
      // Check if it populated the search
      const searchInput = page.locator('input[placeholder*="ideal customer"], textarea').first();
      const value = await searchInput.inputValue();
      
      expect(value).not.toBe('');
      
      // Screenshot with template applied
      await page.screenshot({
        path: 'tests/screenshots/template-applied.png',
        fullPage: false,
        clip: { x: 0, y: 200, width: 1920, height: 600 }
      });
    }
  });

  test('monitors real-time streaming progress', async ({ page }) => {
    // Start a search
    const searchInput = page.locator('input[placeholder*="ideal customer"], textarea').first();
    await searchInput.fill('Tech startups in Bay Area');
    
    const searchButton = page.locator('button:has-text("Search"), button:has-text("Start")').first();
    await searchButton.click();
    
    // Wait for streaming indicators
    await page.waitForTimeout(1000);
    
    // Look for progress indicators
    const progressBar = page.locator('[role="progressbar"], .progress-bar, [data-testid="progress"]');
    const streamStatus = page.locator('.stream-status, [data-testid="stream-status"]');
    
    // Capture multiple frames of streaming
    for (let i = 0; i < 5; i++) {
      await page.screenshot({
        path: `tests/screenshots/streaming-frame-${i}.png`,
        fullPage: false,
        clip: { x: 0, y: 300, width: 1920, height: 500 }
      });
      await page.waitForTimeout(1000);
    }
    
    // Check for live updates
    if (await progressBar.count() > 0) {
      const progress = await progressBar.getAttribute('aria-valuenow');
      console.log('Progress value:', progress);
    }
    
    if (await streamStatus.count() > 0) {
      const statusText = await streamStatus.textContent();
      console.log('Stream status:', statusText);
    }
  });

  test('interacts with lead results', async ({ page }) => {
    // Wait for lead table or cards
    await page.waitForSelector('.lead-table, [data-testid="lead-card"], table', { timeout: 5000 }).catch(() => {});
    
    // Screenshot results area
    await page.screenshot({
      path: 'tests/screenshots/lead-results.png',
      fullPage: true
    });
    
    // Try to click on a lead
    const leadRow = page.locator('tr:has-text("TechCorp"), [data-testid="lead-card"]').first();
    
    if (await leadRow.count() > 0) {
      await leadRow.click();
      await page.waitForTimeout(500);
      
      // Check if detail panel opened
      const detailPanel = page.locator('[data-testid="lead-detail"], .lead-detail-panel');
      
      if (await detailPanel.count() > 0) {
        await page.screenshot({
          path: 'tests/screenshots/lead-detail-panel.png',
          fullPage: true
        });
      }
    }
  });

  test('tests export functionality', async ({ page }) => {
    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has([data-icon="download"])').first();
    
    if (await exportButton.count() > 0) {
      await exportButton.click();
      await page.waitForTimeout(500);
      
      // Check for export modal
      const exportModal = page.locator('[role="dialog"]:has-text("Export"), .export-modal');
      
      if (await exportModal.count() > 0) {
        await page.screenshot({
          path: 'tests/screenshots/export-modal.png',
          fullPage: true
        });
        
        // Check export options
        const csvOption = page.locator('button:has-text("CSV")');
        const salesforceOption = page.locator('button:has-text("Salesforce")');
        
        console.log('Export options available:', {
          csv: await csvOption.count() > 0,
          salesforce: await salesforceOption.count() > 0
        });
      }
    }
  });
});