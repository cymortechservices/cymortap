import { defineConfig, devices } from '@playwright/test';

// Requires the backend (npm run dev in /backend) and frontend (npm run dev) to be running,
// or set PLAYWRIGHT_BASE_URL to a deployed frontend.
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000' },
  projects: [
    { name: 'mobile-360', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
