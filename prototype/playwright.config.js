import { defineConfig, devices } from '@playwright/test';

// Browser: the installed Google Chrome by default, because Windows Smart App Control blocks
// the unsigned Chromium builds downloaded by `npx playwright install` on the dev machine.
// PW_CHANNEL=chromium uses the bundled build (e.g. in CI); PW_CHANNEL=msedge uses Edge.
const requested = process.env.PW_CHANNEL ?? 'chrome';
const channel = requested === 'chromium' ? undefined : requested;

// PW_EXECUTABLE points at a specific Chromium binary (e.g. a preinstalled one whose revision
// differs from this Playwright version). Software WebGL (SwiftShader) then needs to be allowed.
const executable = process.env.PW_EXECUTABLE;
const browser = executable
  ? { channel: undefined, launchOptions: { executablePath: executable, args: ['--enable-unsafe-swiftshader'] } }
  : requested === 'chromium'
    ? { channel, launchOptions: { args: ['--enable-unsafe-swiftshader'] } } // CI: no GPU, software WebGL
    : { channel };
const softwareGl = !!executable || requested === 'chromium';

// Own port for tests; never reuse a running server, so a dev server from another
// checkout can't be tested by mistake. Override with PW_PORT if it is busy.
const port = Number(process.env.PW_PORT ?? 4173);

// `npm test` runs against the Vite dev server; `npm run test:build` builds and runs
// the same suite against the production bundle served by `vite preview`.
const server = `--host 127.0.0.1 --port ${port} --strictPort`;
// `npm run test:orcamento` runs only the budget measurements (tests/orcamento.spec.js), one at a
// time against the build: parallel workers compete for CPU and GPU and spoil the numbers.
const orcamento = process.env.npm_lifecycle_event === 'test:orcamento';
const againstBuild = orcamento || process.env.npm_lifecycle_event === 'test:build' || process.env.PW_TARGET === 'build';
const command = againstBuild ? `npx vite build && npx vite preview ${server}` : `npx vite ${server}`;

export default defineConfig({
  testDir: './tests',
  testIgnore: orcamento ? [] : ['**/orcamento.spec.js'],
  ...(orcamento && { testMatch: '**/orcamento.spec.js', workers: 1 }),
  // Software WebGL (PW_EXECUTABLE or PW_CHANNEL=chromium) draws a frame in a fraction of a second at best, and the
  // 390 × 844 project renders at 3x: give tests and assertions more time there only.
  timeout: softwareGl ? 90_000 : 30_000,
  expect: { timeout: softwareGl ? 15_000 : 5_000 },
  fullyParallel: true,
  // The suite fails at random (5-7 tests per run) with the default one-worker-per-core: 3D scenes
  // compete for CPU and GPU. Two workers passes whole (ticket 11).
  workers: 2,
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
      use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-390',
      use: {
        ...devices['Desktop Chrome'],
        ...browser,
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
