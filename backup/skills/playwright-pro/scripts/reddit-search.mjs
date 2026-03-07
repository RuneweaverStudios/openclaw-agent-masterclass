#!/usr/bin/env node
/**
 * reddit-search.mjs — Search Reddit via JSON API + Playwright fallback
 *
 * Uses Reddit's public JSON API (no auth needed). Falls back to browser if blocked.
 *
 * Usage:
 *   node reddit-search.mjs "search query" [options]
 *
 * Options:
 *   --subreddit <name>     Search within specific subreddit
 *   --sort <type>          relevance|hot|top|new|comments (default: relevance)
 *   --time <range>         hour|day|week|month|year|all (default: all)
 *   --limit <n>            Max results (default: 25)
 *   --format <type>        json|text (default: json)
 *   --timeout <ms>         Timeout (default: 30000)
 *
 * Examples:
 *   node reddit-search.mjs "best productivity apps"
 *   node reddit-search.mjs "AI agents" --subreddit LocalLLaMA --sort top --time week
 *   node reddit-search.mjs "startup advice" --limit 10 --format text
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

async function searchViaJson(args) {
  const sort = args.sort || 'relevance';
  const time = args.time || 'all';
  const limit = parseInt(args.limit || '25', 10);

  let apiUrl;
  if (args.subreddit) {
    apiUrl = `https://www.reddit.com/r/${args.subreddit}/search.json?q=${encodeURIComponent(args.query)}&sort=${sort}&t=${time}&limit=${limit}&restrict_sr=on`;
  } else {
    apiUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(args.query)}&sort=${sort}&t=${time}&limit=${limit}`;
  }

  // Use Playwright to fetch JSON (avoids CORS and rate-limit issues with native fetch)
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // Block everything except the API request
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.includes('search.json') || url.includes('reddit.com/api')) {
        return route.continue();
      }
      return route.abort();
    });

    const response = await page.goto(apiUrl, {
      waitUntil: 'domcontentloaded',
      timeout: parseInt(args.timeout || '30000', 10),
    });

    const text = await page.locator('body').textContent();
    const data = JSON.parse(text);

    const posts = (data.data?.children || []).map(child => {
      const d = child.data;
      return {
        title: d.title || '',
        url: d.url || '',
        author: d.author || '',
        score: d.score || 0,
        commentCount: d.num_comments || 0,
        subreddit: d.subreddit_name_with_prefix || `r/${d.subreddit}`,
        permalink: `https://www.reddit.com${d.permalink}`,
        timestamp: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : '',
        preview: (d.selftext || '').slice(0, 300),
        isNsfw: d.over_18 || false,
        flair: d.link_flair_text || '',
      };
    });

    return posts;
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.query) {
    console.error('Usage: node reddit-search.mjs "search query" [options]');
    process.exit(1);
  }

  const posts = await searchViaJson(args);

  if (args.format === 'text') {
    for (const post of posts) {
      console.log(`[${post.score}↑] ${post.title}`);
      console.log(`  ${post.subreddit} | u/${post.author} | ${post.commentCount} comments`);
      console.log(`  ${post.permalink}`);
      if (post.preview) console.log(`  ${post.preview.slice(0, 150)}...`);
      console.log('');
    }
  } else {
    console.log(JSON.stringify(posts, null, 2));
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
