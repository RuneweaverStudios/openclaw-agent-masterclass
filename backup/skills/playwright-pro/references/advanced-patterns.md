# Advanced Patterns

## Intercepting API Responses

Capture API data directly instead of scraping DOM — faster and more reliable.

```javascript
// Capture all API responses
const apiData = [];
page.on('response', async response => {
  if (response.url().includes('/api/') && response.status() === 200) {
    try {
      const json = await response.json();
      apiData.push({ url: response.url(), data: json });
    } catch { /* not JSON */ }
  }
});

await page.goto('https://example.com');
// apiData now contains all API responses
```

## Network Request Modification

```javascript
// Block tracking/analytics
await page.route('**/*', route => {
  const url = route.request().url();
  if (url.includes('analytics') || url.includes('tracking') || url.includes('ads')) {
    return route.abort();
  }
  return route.continue();
});

// Modify request headers
await page.route('**/api/**', route => {
  route.continue({
    headers: { ...route.request().headers(), 'Authorization': 'Bearer token123' },
  });
});

// Mock API responses
await page.route('**/api/products', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Mock Product' }]),
  });
});
```

## File Download Handling

```javascript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('link', { name: 'Download Report' }).click(),
]);
const path = await download.path();
await download.saveAs('/tmp/report.pdf');
console.log(`Downloaded: ${download.suggestedFilename()}`);
```

## Multi-Tab / Popup Handling

```javascript
// Handle popup windows
const [popup] = await Promise.all([
  page.waitForEvent('popup'),
  page.getByRole('link', { name: 'Open in new window' }).click(),
]);
await popup.waitForLoadState();
const popupContent = await popup.locator('body').textContent();
```

## Geolocation & Permissions

```javascript
const context = await browser.newContext({
  geolocation: { latitude: 37.7749, longitude: -122.4194 },
  permissions: ['geolocation'],
  locale: 'en-US',
  timezoneId: 'America/Los_Angeles',
});
```

## PDF Generation with Custom Options

```javascript
await page.pdf({
  path: 'output.pdf',
  format: 'A4',
  margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:10px;text-align:center;width:100%">Report</div>',
  footerTemplate: '<div style="font-size:10px;text-align:center;width:100%"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
});
```

## Accessibility Snapshot (Structured Extraction)

```javascript
// Get accessibility tree — great for understanding page structure
const snapshot = await page.accessibility.snapshot();
console.log(JSON.stringify(snapshot, null, 2));
```

## Storage State Management

```javascript
// Save complete browser state
await context.storageState({ path: 'state.json' });

// Auth state includes:
// - All cookies
// - localStorage for all origins
// - sessionStorage (partially)

// Restore in new session
const context = await browser.newContext({ storageState: 'state.json' });
```

## Parallel Page Processing

```javascript
// Process multiple pages in same context
async function processInParallel(context, urls, handler, concurrency = 5) {
  const results = [];
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      const page = await context.newPage();
      try {
        results.push(await handler(page, url));
      } catch (e) {
        results.push({ url, error: e.message });
      } finally {
        await page.close();
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}
```
