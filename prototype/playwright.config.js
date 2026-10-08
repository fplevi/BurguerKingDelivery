import { defineConfig, devices } from '@playwright/test';

// Browser: the installed Google Chrome by default, because Windows Smart App Control blocks
// the unsigned Chromium builds downloaded by `npx playwright install` on the dev machine.
// PW_CHANNEL=chromium uses the bundled build (e.g. in CI); PW_CHANNEL=msedge uses Edge.
const requested = process.env.PW_CHANNEL ?? 'chrome';
const channel = requested === 'chromium' ? undefined : requested;

// Own port for tests; never reuse a running server, so a dev server from another
// checkout can't be tested by mistake. Override with PW_PORT if it is busy.
const port = Number(process.env.PW_PORT ?? 4173);

// `npm test` runs against the Vite dev server; `npm run test:build` builds and runs
// the same suite against the production bundle served by `vite preview`.
const server = `--host 127.0.0.1 --port ${port} --strictPort`;
const againstBuild = process.env.npm_lifecycle_event === 'test:build' || process.env.PW_TARGET === 'build';
const command = againstBuild ? `npx vite build && npx vite preview ${server}` : `npx vite ${server}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel, viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-390',
      use: {
        ...devices['Desktop Chrome'],
        channel,
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
});
