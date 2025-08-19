// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  testIgnore: ['unit/**', '*.spec.ts', '*.spec.jsx'],
  testMatch: ['**/*.spec.js', '**/visual-regression-test.js', '**/debug.spec.js', '**/main-page-check.spec.js'],
  timeout: 3 * 60 * 1000, // 테스트 전체 타임아웃 3분으로 설정
  /* Run tests in files in parallel */
  // fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }]],
  
  // Visual Testing 설정
  expect: {
    // Visual comparison threshold (차이 허용 범위)
    toHaveScreenshot: { 
      threshold: 0.2
    },
    // 애니메이션 대기 시간
    toMatchSnapshot: { 
      threshold: 0.2 
    }
  },
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: `http://localhost:${process.env.PORT || 3900}`,
    trace: 'on-first-retry',
    headless: true,
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 }
    },
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: 50,
    }
  },
  
  webServer: {
    command: 'npm run kill-port:safe && npm run dev',
    url: `http://localhost:${process.env.PORT || 3900}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
}); 