import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for visual testing and UI analysis
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot capture settings */
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    /* Video recording settings */
    video: {
      mode: 'retain-on-failure',
      size: { width: 1920, height: 1080 }
    },
    
    /* Viewport size for testing */
    viewport: { width: 1920, height: 1080 },
    
    /* Action timeout */
    actionTimeout: 10000,
    
    /* Navigation timeout */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 }
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 }
      },
    },

    /* Test against tablet viewports. */
    {
      name: 'iPad',
      use: { 
        ...devices['iPad (gen 7)'],
        viewport: { width: 810, height: 1080 }
      },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'Google Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1920, height: 1080 }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Global timeout for the whole test run */
  globalTimeout: 10 * 60 * 1000, // 10 minutes

  /* Each test timeout */
  timeout: 60 * 1000, // 1 minute

  /* Settings for visual regression testing */
  expect: {
    /* Maximum difference in pixels for screenshot comparison */
    toHaveScreenshot: { 
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled'
    }
  },
});