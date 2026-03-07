---
name: playwright-pro
description: "Production-grade browser automation with Playwright. Ready-to-run scripts for scraping, form filling, monitoring, auth flows, and multi-page extraction. Use when: (1) scraping JavaScript-rendered pages, (2) automating form submissions or logins, (3) monitoring pages for changes, (4) extracting data from tables/links/dynamic content, (5) taking screenshots or PDFs, (6) batch-scraping multiple URLs, (7) managing authenticated sessions across scripts. NOT for: static HTML (use web_fetch), simple page reads (use web_fetch), or when OpenClaw built-in browser tool suffices."
---

# Playwright Pro

Production browser automation for agents. Ships with executable scripts — not just docs.

## Prerequisites

```bash
npm ls playwright 2>/dev/null || npm i playwright
npx playwright install chromium
```

## Scripts Reference

All scripts are in `scripts/` — run with `node <script>`. All output JSON to stdout, logs to stderr.

### scrape.mjs — Universal Scraper

```bash
# Basic text extraction
node scrape.mjs https://example.com

# Extract specific elements
node scrape.mjs https://example.com --selector "h1, .price" --format json

# Screenshot
node scrape.mjs https://example.com --screenshot shot.png --full-page

# Extract all links
node scrape.mjs https://example.com --links

# Extract table as JSON
node scrape.mjs https://example.com --table

# Fast scrape (block images/fonts)
node scrape.mjs https://example.com --block-media

# Execute JS in page
node scrape.mjs https://example.com --js "document.title"

# With auth
node scrape.mjs https://example.com --auth auth.json

# Wait for dynamic content
node scrape.mjs https://example.com --wait ".loaded" --selector ".results"

# Infinite scroll pages
node scrape.mjs https://example.com --scroll --selector ".items"
```

Key flags: `--selector`, `--format` (text|html|json), `--wait`, `--scroll`, `--links`, `--table`, `--all-tables`, `--screenshot`, `--pdf`, `--block-media`, `--js`, `--auth`, `--save-auth`, `--cookie`, `--header`, `--viewport`, `--user-agent`

### fill-form.mjs — Form Automation

```bash
node fill-form.mjs https://example.com/signup --fields '[
  {"selector": "#name", "value": "John"},
  {"selector": "#email", "value": "john@example.com"},
  {"selector": "select[name=plan]", "value": "pro", "type": "select"},
  {"selector": "#terms", "type": "check"},
  {"selector": "button[type=submit]", "type": "click"}
]' --wait-nav --screenshot result.png
```

Field types: `fill` (default), `select`, `check`, `uncheck`, `click`, `upload`, `role`, `label`

### auth-flow.mjs — Login & Save Session

```bash
# Save authenticated session for reuse by other scripts
node auth-flow.mjs https://app.example.com/login \
  --fields '[{"selector":"#email","value":"me@x.com"},{"selector":"#pass","value":"s3cret"},{"selector":"button[type=submit]","type":"click"}]' \
  --save auth.json --success-url "**/dashboard"

# With 2FA (opens visible browser, pauses for manual entry)
node auth-flow.mjs https://app.example.com/login \
  --fields '[...]' --save auth.json --2fa-pause --headless false
```

Then reuse: `node scrape.mjs https://app.example.com/data --auth auth.json`

### monitor.mjs — Change Detection

```bash
# Monitor price changes
node monitor.mjs https://example.com/product --selector ".price"

# Custom state file
node monitor.mjs https://example.com/stock --selector ".availability" --state stock.json
```

Outputs `{ "changed": true|false, "current": "...", "previous": "..." }`. Exit code 2 = changed.

### multi-scrape.mjs — Batch Scraping

```bash
# Scrape multiple URLs concurrently
node multi-scrape.mjs --urls '["https://a.com","https://b.com","https://c.com"]' \
  --selector h1 --concurrency 3

# From file
cat urls.json | node multi-scrape.mjs --stdin --block-media
```

## Inline Playwright (when scripts don't fit)

For custom one-off tasks, write inline. Core pattern:

```javascript
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // ... your logic ...
} finally {
  await browser.close();  // ALWAYS close
}
```

### Selector Priority

1. `getByRole('button', { name: 'Submit' })` — best resilience
2. `getByLabel('Email')` — forms
3. `getByPlaceholder('Search...')` — inputs
4. `getByTestId('submit-btn')` — explicit
5. `locator('.class')` — last resort

### Common Traps

| Trap | Fix |
|------|-----|
| Element not found | `await locator.waitFor()` before interacting |
| Flaky clicks | `click({ force: true })` or wait for `state: 'visible'` |
| SPA never idle | Wait for specific element, not `networkidle` |
| Auth lost | Use `storageState` to persist/restore sessions |
| Blocked as bot | See `references/anti-detection.md` |

### reddit-search.mjs — Reddit Search

```bash
# Search all of Reddit
node reddit-search.mjs "AI agents" --limit 10 --sort top --time week

# Search specific subreddit
node reddit-search.mjs "startup advice" --subreddit startups --format text
```

Uses Reddit's JSON API (no auth needed). Extracts title, author, score, comments, subreddit, flair.

### reddit-thread.mjs — Reddit Thread Extractor

```bash
# Extract post + comments
node reddit-thread.mjs "https://reddit.com/r/startups/comments/abc/title/" --limit 20 --depth 2

# Text format for reading
node reddit-thread.mjs "https://reddit.com/r/AskReddit/comments/xyz/" --format text
```

Nested comment extraction with configurable depth. Uses JSON API.

### x-search.mjs — X/Twitter Search

**Requires auth state.** Create it first:
```bash
node auth-flow.mjs https://x.com/login --fields '[...]' --save x-auth.json --2fa-pause --headless false
```

```bash
# Search X
node x-search.mjs "OpenClaw AI" --auth x-auth.json

# Advanced filters
node x-search.mjs "AI startups" --auth x-auth.json --sort latest --min-likes 50 --from elonmusk
```

### x-profile.mjs — X/Twitter Profile Scraper

```bash
# Profile info + recent posts
node x-profile.mjs naval --auth x-auth.json --limit 30 --format text
```

## Advanced Topics

- **Stealth & anti-detection**: `references/anti-detection.md` — user agent rotation, headless bypass, proxy, cookie consent
- **Advanced patterns**: `references/advanced-patterns.md` — API interception, downloads, popups, geo, parallel processing
