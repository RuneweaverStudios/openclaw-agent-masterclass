#!/usr/bin/env node
/**
 * auth-flow.mjs — Login and save session state for reuse
 *
 * Automates login flows and persists browser state (cookies, localStorage)
 * so other scripts can skip authentication.
 *
 * Usage:
 *   node auth-flow.mjs <login-url> --fields '<json>' --save <path> [options]
 *
 * Options:
 *   --fields <json>        Form fields (same format as fill-form.mjs)
 *   --save <path>          Save auth state to this file
 *   --success-url <glob>   URL pattern to wait for after login (e.g. "**/dashboard")
 *   --success-sel <css>    Element to wait for after login (e.g. ".user-menu")
 *   --screenshot <path>    Screenshot after login
 *   --timeout <ms>         Timeout (default: 30000)
 *   --headless <bool>      Headless mode (default: true)
 *   --2fa-pause            Pause for manual 2FA entry (opens visible browser)
 *
 * Examples:
 *   node auth-flow.mjs https://app.example.com/login \
 *     --fields '[{"selector":"#email","value":"me@x.com"},{"selector":"#pass","value":"secret"},{"selector":"button[type=submit]","type":"click"}]' \
 *     --save auth-example.json --success-url "**/dashboard"
 *
 *   node auth-flow.mjs https://app.example.com/login \
 *     --fields '[...]' --save auth.json --2fa-pause --headless false
 */

import { chromium } from 'playwright';

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
    if (key === '2fa-pause') { args.tfaPause = true; i++; continue; }
    args[key] = argv[++i]; i++;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.url || !args.fields || !args.save) {
    console.error('Usage: node auth-flow.mjs <login-url> --fields \'<json>\' --save <path>');
    process.exit(1);
  }

  const fields = JSON.parse(args.fields);
  const headless = args.headless !== 'false' && !args.tfaPause;
  const timeout = parseInt(args.timeout || '30000', 10);

  const browser = await chromium.launch({ headless });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(args.url, { waitUntil: 'domcontentloaded', timeout });

    // Fill form fields
    for (const field of fields) {
      const type = field.type || 'fill';
      const locator = page.locator(field.selector);
      await locator.waitFor({ state: 'visible', timeout });

      switch (type) {
        case 'fill': await locator.fill(field.value || ''); break;
        case 'select': await locator.selectOption(field.value); break;
        case 'check': await locator.check(); break;
        case 'click': await locator.click(); break;
        default: await locator.fill(field.value || '');
      }
      await page.waitForTimeout(100);
    }

    // Wait for 2FA if needed
    if (args.tfaPause) {
      console.error('🔐 Browser is open. Complete 2FA manually, then press Enter here...');
      await new Promise(resolve => {
        process.stdin.once('data', resolve);
      });
    }

    // Wait for success indicator
    if (args['success-url']) {
      await page.waitForURL(args['success-url'], { timeout: timeout * 2 });
    }
    if (args['success-sel']) {
      await page.waitForSelector(args['success-sel'], { timeout: timeout * 2 });
    }

    // Give the page a moment to settle (set cookies, etc.)
    await page.waitForTimeout(2000);

    // Save state
    await context.storageState({ path: args.save });
    console.error(`✅ Auth state saved: ${args.save}`);

    if (args.screenshot) {
      await page.screenshot({ path: args.screenshot, fullPage: true });
      console.error(`Screenshot saved: ${args.screenshot}`);
    }

    console.log(JSON.stringify({
      url: page.url(),
      title: await page.title(),
      authFile: args.save,
      status: 'authenticated',
    }, null, 2));

  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
