#!/usr/bin/env node
/**
 * fill-form.mjs — Automated form filler for OpenClaw agents
 *
 * Usage:
 *   node fill-form.mjs <url> --fields '<json>' [options]
 *
 * Fields JSON format:
 *   [
 *     { "selector": "#email", "value": "user@example.com", "type": "fill" },
 *     { "selector": "select[name='country']", "value": "US", "type": "select" },
 *     { "selector": "#agree", "type": "check" },
 *     { "selector": "button[type='submit']", "type": "click" }
 *   ]
 *
 * Field types:
 *   fill     — Type text into input/textarea (default)
 *   select   — Select dropdown option by value
 *   check    — Check a checkbox
 *   uncheck  — Uncheck a checkbox
 *   click    — Click an element
 *   upload   — Upload file (value = file path)
 *   role     — Use getByRole (selector = role, value = name)
 *   label    — Use getByLabel (selector = label text, value = text to fill)
 *
 * Options:
 *   --auth <path>          Load auth state
 *   --save-auth <path>     Save auth state after form submission
 *   --wait <selector>      Wait for selector after last action
 *   --wait-nav             Wait for navigation after last action
 *   --screenshot <path>    Screenshot after completion
 *   --timeout <ms>         Timeout (default: 30000)
 *   --headless <bool>      Run headless (default: true)
 *   --delay <ms>           Delay between actions (default: 100)
 *
 * Examples:
 *   node fill-form.mjs https://example.com/login --fields '[
 *     {"selector": "#email", "value": "me@example.com"},
 *     {"selector": "#password", "value": "secret"},
 *     {"selector": "button[type=submit]", "type": "click"}
 *   ]' --wait-nav --save-auth auth.json
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
    if (key === 'wait-nav') { args.waitNav = true; i++; continue; }
    args[key] = argv[++i]; i++;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.url || !args.fields) {
    console.error('Usage: node fill-form.mjs <url> --fields \'<json>\' [options]');
    process.exit(1);
  }

  const fields = JSON.parse(args.fields);
  const headless = args.headless !== 'false';
  const timeout = parseInt(args.timeout || '30000', 10);
  const delay = parseInt(args.delay || '100', 10);

  const browser = await chromium.launch({ headless });
  try {
    const contextOpts = args.auth ? { storageState: args.auth } : {};
    const context = await browser.newContext(contextOpts);
    const page = await context.newPage();
    await page.goto(args.url, { waitUntil: 'domcontentloaded', timeout });

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const type = field.type || 'fill';
      const isLast = i === fields.length - 1;

      let locator;
      if (type === 'role') {
        locator = page.getByRole(field.selector, field.value ? { name: field.value } : {});
      } else if (type === 'label') {
        locator = page.getByLabel(field.selector);
      } else {
        locator = page.locator(field.selector);
      }

      await locator.waitFor({ state: 'visible', timeout });

      switch (type) {
        case 'fill':
        case 'label':
          await locator.fill(field.value || '');
          break;
        case 'select':
          await locator.selectOption(field.value);
          break;
        case 'check':
          await locator.check();
          break;
        case 'uncheck':
          await locator.uncheck();
          break;
        case 'click':
        case 'role':
          if (isLast && args.waitNav) {
            await Promise.all([
              page.waitForNavigation({ timeout }),
              locator.click(),
            ]);
          } else {
            await locator.click();
          }
          break;
        case 'upload':
          await locator.setInputFiles(field.value);
          break;
        default:
          console.error(`Unknown field type: ${type}`);
      }

      if (delay > 0 && !isLast) {
        await page.waitForTimeout(delay);
      }
    }

    if (args.wait) {
      await page.waitForSelector(args.wait, { timeout });
    }

    if (args.screenshot) {
      await page.screenshot({ path: args.screenshot, fullPage: true });
      console.error(`Screenshot saved: ${args.screenshot}`);
    }

    if (args['save-auth']) {
      await context.storageState({ path: args['save-auth'] });
      console.error(`Auth state saved: ${args['save-auth']}`);
    }

    // Output final page info
    console.log(JSON.stringify({
      url: page.url(),
      title: await page.title(),
      status: 'completed',
    }, null, 2));

  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
