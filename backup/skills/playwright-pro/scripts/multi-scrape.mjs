#!/usr/bin/env node
/**
 * multi-scrape.mjs — Scrape multiple URLs concurrently
 *
 * Usage:
 *   node multi-scrape.mjs --urls '<json array>' [options]
 *   echo '["https://a.com","https://b.com"]' | node multi-scrape.mjs --stdin [options]
 *
 * Options:
 *   --urls <json>          JSON array of URLs
 *   --stdin                Read URLs from stdin (JSON array)
 *   --selector <css>       Extract matching elements (default: body)
 *   --format <type>        text|html|json (default: text)
 *   --concurrency <n>     Max concurrent pages (default: 5)
 *   --timeout <ms>        Per-page timeout (default: 30000)
 *   --block-media         Block images/fonts/media
 *   --wait <selector>     Wait for selector on each page
 *   --links               Extract links from each page
 *   --delay <ms>          Delay between launches (default: 200)
 *
 * Output: JSON array of { url, data, error? }
 *
 * Examples:
 *   node multi-scrape.mjs --urls '["https://a.com","https://b.com"]' --selector h1
 *   cat urls.json | node multi-scrape.mjs --stdin --block-media --format text
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { i++; continue; }
    const key = arg.slice(2);
    if (['stdin', 'block-media', 'links'].includes(key)) { args[key] = true; i++; continue; }
    args[key] = argv[++i]; i++;
  }
  return args;
}

async function scrapePage(context, url, args) {
  const page = await context.newPage();
  const timeout = parseInt(args.timeout || '30000', 10);
  try {
    if (args['block-media']) {
      await page.route('**/*', route => {
        const type = route.request().resourceType();
        if (['image', 'media', 'font', 'stylesheet'].includes(type)) return route.abort();
        return route.continue();
      });
    }

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });

    if (args.wait) {
      await page.waitForSelector(args.wait, { timeout });
    }

    if (args.links) {
      const links = await page.$$eval('a[href]', els =>
        els.map(a => ({ text: a.textContent.trim(), href: a.href }))
          .filter(l => l.href && !l.href.startsWith('javascript:'))
      );
      return { url, data: links };
    }

    const selector = args.selector || 'body';
    const format = args.format || 'text';

    let data;
    if (format === 'html') {
      data = await page.locator(selector).first().innerHTML();
    } else if (format === 'json') {
      const elements = await page.locator(selector).all();
      data = [];
      for (const el of elements) {
        data.push({
          tag: await el.evaluate(e => e.tagName.toLowerCase()),
          text: (await el.textContent()).trim(),
        });
      }
    } else {
      data = (await page.locator(selector).first().textContent()).trim();
    }

    return { url, data };
  } catch (e) {
    return { url, data: null, error: e.message };
  } finally {
    await page.close();
  }
}

async function main() {
  const args = parseArgs(process.argv);

  let urls;
  if (args.stdin) {
    const input = readFileSync('/dev/stdin', 'utf-8');
    urls = JSON.parse(input);
  } else if (args.urls) {
    urls = JSON.parse(args.urls);
  } else {
    console.error('Usage: node multi-scrape.mjs --urls \'["url1","url2"]\' [options]');
    process.exit(1);
  }

  const concurrency = parseInt(args.concurrency || '5', 10);
  const delay = parseInt(args.delay || '200', 10);

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const results = [];
    const queue = [...urls];
    const active = new Set();

    while (queue.length > 0 || active.size > 0) {
      while (active.size < concurrency && queue.length > 0) {
        const url = queue.shift();
        const promise = scrapePage(context, url, args).then(result => {
          results.push(result);
          active.delete(promise);
        });
        active.add(promise);
        if (delay > 0 && queue.length > 0) {
          await new Promise(r => setTimeout(r, delay));
        }
      }
      if (active.size > 0) {
        await Promise.race(active);
      }
    }

    // Sort results in original URL order
    const urlIndex = Object.fromEntries(urls.map((u, i) => [u, i]));
    results.sort((a, b) => (urlIndex[a.url] ?? 0) - (urlIndex[b.url] ?? 0));

    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
