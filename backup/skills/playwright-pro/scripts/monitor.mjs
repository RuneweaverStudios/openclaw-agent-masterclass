#!/usr/bin/env node
/**
 * monitor.mjs — Page change monitor for OpenClaw agents
 *
 * Checks a URL for changes and outputs diff. Useful for:
 * - Price monitoring / deal alerts
 * - Stock/availability checking
 * - Content change detection
 * - Competitor monitoring
 *
 * Usage:
 *   node monitor.mjs <url> [options]
 *
 * Options:
 *   --selector <css>       Element to monitor (default: body)
 *   --state <path>         State file for comparison (default: .monitor-state/<hash>.json)
 *   --wait <selector>      Wait for selector before extracting
 *   --screenshot <path>    Save screenshot
 *   --block-media          Block images/fonts for speed
 *   --timeout <ms>         Timeout (default: 30000)
 *   --auth <path>          Load auth state
 *
 * Output (JSON):
 *   { "changed": true|false, "current": "...", "previous": "...", "diff": "..." }
 *
 * Exit codes:
 *   0 = no change
 *   1 = error
 *   2 = content changed
 *
 * Examples:
 *   node monitor.mjs https://example.com/product --selector ".price"
 *   node monitor.mjs https://example.com/stock --selector ".availability" --state stock.json
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { dirname } from 'path';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      if (!args.url) args.url = arg;
      i++; continue;
    }
    const key = arg.slice(2);
    if (key === 'block-media') { args.blockMedia = true; i++; continue; }
    args[key] = argv[++i]; i++;
  }
  return args;
}

function getStateFile(url, selector, explicit) {
  if (explicit) return explicit;
  const hash = createHash('md5').update(`${url}|${selector}`).digest('hex').slice(0, 12);
  const dir = '.monitor-state';
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return `${dir}/${hash}.json`;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.url) {
    console.error('Usage: node monitor.mjs <url> [options]');
    process.exit(1);
  }

  const selector = args.selector || 'body';
  const timeout = parseInt(args.timeout || '30000', 10);
  const stateFile = getStateFile(args.url, selector, args.state);

  const browser = await chromium.launch({ headless: true });
  try {
    const contextOpts = args.auth ? { storageState: args.auth } : {};
    const context = await browser.newContext(contextOpts);
    const page = await context.newPage();

    if (args.blockMedia) {
      await page.route('**/*', route => {
        const type = route.request().resourceType();
        if (['image', 'media', 'font', 'stylesheet'].includes(type)) return route.abort();
        return route.continue();
      });
    }

    await page.goto(args.url, { waitUntil: 'domcontentloaded', timeout });

    if (args.wait) {
      await page.waitForSelector(args.wait, { timeout });
    }

    const current = (await page.locator(selector).first().textContent()).trim();

    if (args.screenshot) {
      await page.screenshot({ path: args.screenshot, fullPage: true });
    }

    // Load previous state
    let previous = null;
    if (existsSync(stateFile)) {
      try {
        const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
        previous = state.content;
      } catch { /* ignore corrupt state */ }
    }

    // Save current state
    const stateDir = dirname(stateFile);
    if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
    writeFileSync(stateFile, JSON.stringify({
      content: current,
      url: args.url,
      selector,
      timestamp: new Date().toISOString(),
    }, null, 2));

    const changed = previous !== null && previous !== current;
    const result = { changed, current };
    if (previous !== null) result.previous = previous;

    console.log(JSON.stringify(result, null, 2));
    process.exit(changed ? 2 : 0);

  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
