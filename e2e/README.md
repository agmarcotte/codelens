# E2E Tests

End-to-end tests for CodeLens using Puppeteer.

## Setup

E2E tests require both the frontend and backend servers to be running.

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run dev
```

3. Start the frontend server (in another terminal):
```bash
cd client && npm run dev
```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run E2E tests in watch mode
```bash
npm run test:e2e:watch
```

### Run with screenshots on failure
Screenshots are automatically saved to `e2e/screenshots/` when tests fail.

## Test Structure

```
e2e/
├── __tests__/          # Test files
│   ├── homepage.e2e.ts
│   └── navigation.e2e.ts
├── helpers/            # Test utilities
│   └── setup.ts
├── screenshots/        # Failure screenshots
├── jest.config.js      # Jest configuration
└── README.md          # This file
```

## Writing Tests

### Basic Test Template

```typescript
import { Page } from 'puppeteer';
import {
  setupBrowser,
  createPage,
  closeBrowser,
  navigateTo,
  waitForSelector,
} from '../helpers/setup';

describe('Feature E2E Tests', () => {
  let page: Page;

  beforeAll(async () => {
    await setupBrowser();
  });

  beforeEach(async () => {
    page = await createPage();
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  afterAll(async () => {
    await closeBrowser();
  });

  it('should test feature', async () => {
    await navigateTo(page, '/');
    await waitForSelector(page, '.some-element');
    
    // Your test assertions
    expect(true).toBe(true);
  });
});
```

## Environment Variables

- `E2E_BASE_URL`: Frontend URL (default: http://localhost:5173)
- `E2E_API_URL`: Backend API URL (default: http://localhost:3000)

## Best Practices

1. **Always clean up**: Close pages and browser in afterEach/afterAll
2. **Use helpers**: Utilize helper functions from `helpers/setup.ts`
3. **Take screenshots**: On test failures for debugging
4. **Wait for elements**: Use `waitForSelector` instead of arbitrary timeouts
5. **Test user flows**: Focus on complete user journeys
6. **Keep tests independent**: Each test should be able to run in isolation

## Debugging

### Run tests in headed mode

Modify `helpers/setup.ts` to set `headless: false`:

```typescript
browser = await puppeteer.launch({
  headless: false, // Change this
  args: ['--no-sandbox'],
});
```

### Slow down execution

Add `slowMo` option:

```typescript
browser = await puppeteer.launch({
  headless: false,
  slowMo: 100, // Slow down by 100ms
});
```

### View screenshots

Check `e2e/screenshots/` directory for failure screenshots.

## Troubleshooting

### Tests timing out

- Increase timeout in `jest.config.js`
- Check if servers are running
- Verify network connectivity

### Browser not launching

- Install Chromium: `npx puppeteer browsers install chrome`
- Check system dependencies
- Try running with `--no-sandbox` flag

### Flaky tests

- Add proper waits for elements
- Use `waitForNetworkIdle`
- Avoid arbitrary timeouts
- Check for race conditions