const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'npm run start',
    cwd: __dirname,
    url: 'http://127.0.0.1:3000',
    timeout: 120000,
    reuseExistingServer: true,
  },
});
