import { defineConfig, devices } from '@playwright/test';

/*
 * Browser regression tests for navigation, consent, the contact form and responsive layout.
 *
 * The tests build the site with a test form endpoint and a test analytics ID, and serve it with `astro preview`.
 * Every request to Google or to the form endpoint is intercepted, so the tests never send real data.
 *
 * Local runs: `npm run test:e2e`. Set PW_CHANNEL=chrome to use an installed Google Chrome instead of
 * Playwright's own Chromium (`npx playwright install chromium`).
 */
const PORT = 4329;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      PUBLIC_FORM_ENDPOINT: 'https://forms.example.test/f/test',
      PUBLIC_GA_MEASUREMENT_ID: 'G-TEST12345',
    },
  },
});
