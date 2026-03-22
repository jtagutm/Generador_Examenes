import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    slowMo: 1500,
    screenshot: 'only-on-failure',
  },
  timeout: 120000,
});
