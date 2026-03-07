#!/usr/bin/env node
/**
 * x-search.mjs — Search X/Twitter via browser automation
 *
 * IMPORTANT: X requires authentication for search. Run auth-flow.mjs first:
 *   node auth-flow.mjs https://x.com/login \
 *     --fields '[{"selector":"input[autocomplete=username]","value":"your@email.com"},{"selector":"input[autocomplete=username]","type":"click"}]' \
 *     --save x-auth.json --2fa-pause --headless false
 *   (Then manually complete the login flow and 2FA)
 *
 * Usage:
 *   node x-search.mjs "search query" --auth x-auth.json [options]
 *
 * Options:
 *   --auth <path>          Auth state file (REQUIRED)
 *   --limit <n>            Max results (default: 20)
 *   --sort <type>          top|latest (default: top)
 *   --min-likes <n>        Min likes filter (added to query)
 *   --min-retweets <n>     Min retweets filter (added to query)
 *   --since <date>         Since date YYYY-MM-DD (added to query)
 *   --until <date>         Until date YYYY-MM-DD (added to query)
 *   --from <user>          From specific user (added to query)
 *   --format <type>        json|text (default: json)
 *   --timeout <ms>         Timeout (default: 30000)
 *   --scroll <n>           Number of scroll iterations to load more (default: 3)
 *
 * Examples:
 *   node x-search.mjs "OpenClaw AI" --auth x-auth.json
 *   node x-search.mjs "startup funding" --auth x-auth.json --sort latest --min-likes 50
 *   node x-search.mjs "AI agents" --auth x-auth.json --from elonmusk --format text
 */

import { chromium } from 'playwright';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      if (!args.query) args.query = arg;
      i++; continue;
    }
    const key = arg.slice(2);
    args[key] = argv[++i]; i++;
  }
  return args;
}

function buildSearchQuery(args) {
  let q = args.query;
  if (args.from) q += ` from:${args.from}`;
  if (args.since) q += ` since:${args.since}`;
  if (args.until) q += ` until:${args.until}`;
  if (args['min-likes']) q += ` min_faves:${args['min-likes']}`;
  if (args['min-retweets']) q += ` min_retweets:${args['min-retweets']}`;
  return q;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.query) {
    console.error('Usage: node x-search.mjs "query" --auth x-auth.json [options]');
    process.exit(1);
  }
  if (!args.auth) {
    console.error('Error: --auth is required. Run auth-flow.mjs first to create an auth state file.');
    console.error('  node auth-flow.mjs https://x.com/login --fields \'[...]\' --save x-auth.json --2fa-pause --headless false');
    process.exit(1);
  }

  const limit = parseInt(args.limit || '20', 10);
  const sort = args.sort || 'top';
  const timeout = parseInt(args.timeout || '30000', 10);
  const scrollCount = parseInt(args.scroll || '3', 10);

  const fullQuery = buildSearchQuery(args);
  const tab = sort === 'latest' ? '&f=live' : '';
  const searchUrl = `https://x.com/search?q=${encodeURIComponent(fullQuery)}${tab}`;

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      storageState: args.auth,
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout });

    // Wait for tweets to load
    await page.waitForSelector('article[data-testid="tweet"]', { timeout }).catch(() => {});

    // Scroll to load more tweets
    for (let s = 0; s < scrollCount; s++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);
    }

    // Extract tweets
    const tweets = await page.$$eval('article[data-testid="tweet"]', (elements, lim) => {
      return elements.slice(0, lim).map(el => {
        const textEl = el.querySelector('[data-testid="tweetText"]');
        const nameEl = el.querySelector('[data-testid="User-Name"]');
        const timeEl = el.querySelector('time');
        const linkEl = el.querySelector('a[href*="/status/"]');

        // Parse engagement metrics
        const metrics = {};
        const groups = el.querySelectorAll('[role="group"] button');
        const metricNames = ['replies', 'retweets', 'likes', 'views'];
        groups.forEach((btn, i) => {
          const val = btn.querySelector('span[data-testid]')?.textContent?.trim() ||
                      btn.textContent?.trim()?.match(/[\d,.KkMm]+/)?.[0] || '0';
          if (metricNames[i]) metrics[metricNames[i]] = val;
        });

        // Parse name and handle
        const nameText = nameEl?.textContent || '';
        const handleMatch = nameText.match(/@(\w+)/);

        return {
          text: textEl?.textContent?.trim() || '',
          author: nameText.split('@')[0]?.trim() || '',
          handle: handleMatch ? `@${handleMatch[1]}` : '',
          timestamp: timeEl?.getAttribute('datetime') || '',
          url: linkEl ? `https://x.com${linkEl.getAttribute('href')}` : '',
          ...metrics,
        };
      });
    }, limit);

    if (args.format === 'text') {
      for (const t of tweets) {
        console.log(`${t.author} ${t.handle}`);
        console.log(t.text);
        console.log(`♥ ${t.likes || 0}  ↻ ${t.retweets || 0}  💬 ${t.replies || 0}`);
        console.log(t.url);
        console.log('');
      }
    } else {
      console.log(JSON.stringify(tweets, null, 2));
    }

  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
