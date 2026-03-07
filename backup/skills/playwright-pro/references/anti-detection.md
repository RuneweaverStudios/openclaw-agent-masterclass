# Anti-Detection & Stealth

## User Agent Rotation

```javascript
const agents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];
const ua = agents[Math.floor(Math.random() * agents.length)];
const context = await browser.newContext({ userAgent: ua });
```

## Headless Detection Bypass

```javascript
// Override navigator properties that leak headless
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  window.chrome = { runtime: {} };
});
```

## Human-like Behavior

```javascript
// Random delays between actions
const randomDelay = (min = 100, max = 500) =>
  new Promise(r => setTimeout(r, min + Math.random() * (max - min)));

// Type with random per-character delay
await page.locator('#search').pressSequentially('search term', { delay: 50 + Math.random() * 100 });

// Random mouse movements before click
const box = await page.locator('button').boundingBox();
await page.mouse.move(box.x + box.width / 2 + (Math.random() - 0.5) * 10,
                       box.y + box.height / 2 + (Math.random() - 0.5) * 10);
await randomDelay(200, 400);
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
```

## Proxy Support

```javascript
const browser = await chromium.launch({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass',
  },
});
```

## Cookie Consent Handling

```javascript
// Common cookie consent patterns
const consentSelectors = [
  '[id*="cookie"] button[id*="accept"]',
  '[class*="cookie"] button[class*="accept"]',
  '#onetrust-accept-btn-handler',
  '.cc-accept',
  '[data-testid="cookie-accept"]',
  'button:has-text("Accept all")',
  'button:has-text("Accept cookies")',
  'button:has-text("I agree")',
];

async function dismissCookieConsent(page) {
  for (const sel of consentSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) {
        await el.click();
        return true;
      }
    } catch { /* try next */ }
  }
  return false;
}
```

## Rate Limiting Best Practices

- Minimum 1-2s between requests to same domain
- Respect robots.txt
- Use `--block-media` for faster, lighter scraping
- Rotate user agents across sessions
- Back off exponentially on 429/503 responses
