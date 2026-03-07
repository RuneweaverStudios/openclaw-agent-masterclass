#!/usr/bin/env node
/**
 * scrape.mjs — Universal web scraper for OpenClaw agents
 *
 * Usage:
 *   node scrape.mjs <url> [options]
 *
 * Options:
 *   --selector <css>       Extract only matching elements (default: body)
 *   --wait <selector>      Wait for this selector before extracting
 *   --format <type>        Output format: text|html|json|markdown (default: text)
 *   --screenshot <path>    Save screenshot to path
 *   --full-page            Full-page screenshot (default: viewport only)
 *   --pdf <path>           Save page as PDF
 *   --timeout <ms>         Navigation timeout (default: 30000)
 *   --auth <path>          Load auth state from JSON file
 *   --save-auth <path>     Save auth state after navigation
 *   --user-agent <string>  Custom user agent
 *   --viewport <WxH>       Viewport size (default: 1280x720)
 *   --headless <bool>      Run headless (default: true)
 *   --scroll               Scroll to bottom before extracting (for infinite scroll)
 *   --links                Extract all links as JSON array
 *   --table                Extract first table as JSON array of objects
 *   --all-tables           Extract all tables as JSON array of arrays
 *   --cookie <name=value>  Add cookie (repeatable)
 *   --header <name:value>  Add extra HTTP header (repeatable)
 *   --block-media          Block images/fonts/media for faster loads
 *   --js <code>            Execute JS in page context and print result
 *
 * Examples:
 *   node scrape.mjs https://example.com
 *   node scrape.mjs https://example.com --selector "h1, .price" --format json
 *   node scrape.mjs https://example.com --screenshot shot.png --full-page
 *   node scrape.mjs https://example.com --table
 *   node scrape.mjs https://example.com --scroll --links
 *   node scrape.mjs https://example.com --js "document.title"
 *   node scrape.mjs https://example.com --block-media --format text
 */

import { chromium } from 'playwright';

function parseArgs(argv) {
  const args = { cookies: [], headers: {} };
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      if (!args.url) args.url = arg;
      i++; continue;
    }
    const key = arg.slice(2);
    switch (key) {
      case 'full-page': case 'scroll': case 'links': case 'table':
      case 'all-tables': case 'block-media':
        args[key] = true; i++; break;
      case 'cookie':
        args.cookies.push(argv[++i]); i++; break;
      case 'header': {
        const [name, ...rest] = argv[++i].split(':');
        args.headers[name.trim()] = rest.join(':').trim();
        i++; break;
      }
      default:
        args[key] = argv[++i]; i++; break;
    }
  }
  return args;
}

async function scrollToBottom(page) {
  let prev = 0;
  for (let attempts = 0; attempts < 50; attempts++) {
    const height = await page.evaluate(() => document.body.scrollHeight);
    if (height === prev) break;
    prev = height;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  }
}

async function extractTable(page, selector = 'table') {
  return page.$eval(selector, table => {
    const headers = Array.from(table.querySelectorAll('thead th, tr:first-child th, tr:first-child td'))
      .map(th => th.textContent.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr, tr:not(:first-child)'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent.trim());
      if (headers.length && headers.length === cells.length) {
        return Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
      }
      return cells;
    });
  });
}

async function extractAllTables(page) {
  const count = await page.locator('table').count();
  const tables = [];
  for (let i = 0; i < count; i++) {
    try {
      const data = await extractTable(page, `table:nth-of-type(${i + 1})`);
      tables.push(data);
    } catch { /* skip empty tables */ }
  }
  return tables;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.url) {
    console.error('Usage: node scrape.mjs <url> [options]');
    process.exit(1);
  }

  const [vw, vh] = (args.viewport || '1280x720').split('x').map(Number);
  const headless = args.headless !== 'false';
  const timeout = parseInt(args.timeout || '30000', 10);

  const browser = await chromium.launch({ headless });
  try {
    const contextOpts = {
      viewport: { width: vw, height: vh },
      ...(args['user-agent'] && { userAgent: args['user-agent'] }),
      ...(args.auth && { storageState: args.auth }),
    };
    const context = await browser.newContext(contextOpts);

    if (Object.keys(args.headers).length) {
      await context.setExtraHTTPHeaders(args.headers);
    }
    if (args.cookies.length) {
      const parsed = args.cookies.map(c => {
        const [name, ...rest] = c.split('=');
        const url = new URL(args.url);
        return { name, value: rest.join('='), domain: url.hostname, path: '/' };
      });
      await context.addCookies(parsed);
    }

    const page = await context.newPage();

    if (args['block-media']) {
      await page.route('**/*', route => {
        const type = route.request().resourceType();
        if (['image', 'media', 'font', 'stylesheet'].includes(type)) {
          return route.abort();
        }
        return route.continue();
      });
    }

    await page.goto(args.url, { waitUntil: 'domcontentloaded', timeout });

    if (args.wait) {
      await page.waitForSelector(args.wait, { timeout });
    }

    if (args.scroll) {
      await scrollToBottom(page);
    }

    // Execute custom JS
    if (args.js) {
      const result = await page.evaluate(args.js);
      console.log(typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
    }

    // Screenshot
    if (args.screenshot) {
      await page.screenshot({
        path: args.screenshot,
        fullPage: !!args['full-page'],
      });
      console.error(`Screenshot saved: ${args.screenshot}`);
    }

    // PDF
    if (args.pdf) {
      await page.pdf({ path: args.pdf, format: 'A4' });
      console.error(`PDF saved: ${args.pdf}`);
    }

    // Links extraction
    if (args.links) {
      const links = await page.$$eval('a[href]', els =>
        els.map(a => ({ text: a.textContent.trim(), href: a.href }))
          .filter(l => l.href && !l.href.startsWith('javascript:'))
      );
      console.log(JSON.stringify(links, null, 2));
    }

    // Table extraction
    if (args.table) {
      try {
        const data = await extractTable(page);
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {
        console.error('No table found on page');
      }
    }

    if (args['all-tables']) {
      const data = await extractAllTables(page);
      console.log(JSON.stringify(data, null, 2));
    }

    // Text/HTML/JSON extraction (unless we already output links/table/js/screenshot-only/pdf-only)
    const hasOutput = args.links || args.table || args['all-tables'] || args.js;
    const screenshotOnly = args.screenshot && !args.selector && !hasOutput;
    const pdfOnly = args.pdf && !args.selector && !hasOutput;
    if (!hasOutput && !screenshotOnly && !pdfOnly) {
      const selector = args.selector || 'body';
      const format = args.format || 'text';

      if (format === 'html') {
        const html = await page.locator(selector).first().innerHTML();
        console.log(html);
      } else if (format === 'json') {
        const elements = await page.locator(selector).all();
        const data = [];
        for (const el of elements) {
          data.push({
            tag: await el.evaluate(e => e.tagName.toLowerCase()),
            text: (await el.textContent()).trim(),
            html: await el.innerHTML(),
          });
        }
        console.log(JSON.stringify(data, null, 2));
      } else {
        // text (default)
        const text = await page.locator(selector).first().textContent();
        console.log(text.trim());
      }
    }

    // Save auth state
    if (args['save-auth']) {
      await context.storageState({ path: args['save-auth'] });
      console.error(`Auth state saved: ${args['save-auth']}`);
    }

  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
