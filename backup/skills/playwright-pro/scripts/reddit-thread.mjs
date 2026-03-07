#!/usr/bin/env node
/**
 * reddit-thread.mjs — Extract a full Reddit thread with comments via JSON API
 *
 * Usage:
 *   node reddit-thread.mjs <reddit-url> [options]
 *
 * Options:
 *   --depth <n>            Comment nesting depth (default: 3)
 *   --limit <n>            Max top-level comments (default: 50)
 *   --format <type>        json|text (default: json)
 *   --timeout <ms>         Timeout (default: 30000)
 *
 * Examples:
 *   node reddit-thread.mjs https://www.reddit.com/r/startups/comments/abc123/my_post/
 *   node reddit-thread.mjs "https://reddit.com/r/AskReddit/comments/xyz/" --limit 20 --format text
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
    args[key] = argv[++i]; i++;
  }
  return args;
}

function toJsonUrl(url) {
  // Strip trailing slash, add .json
  let clean = url.replace(/\/+$/, '');
  if (!clean.endsWith('.json')) clean += '.json';
  // Ensure www.reddit.com
  clean = clean.replace('://old.reddit.com', '://www.reddit.com')
               .replace('://reddit.com', '://www.reddit.com');
  return clean;
}

function extractComments(children, maxDepth, currentDepth = 0) {
  if (!children || currentDepth > maxDepth) return [];

  return children
    .filter(c => c.kind === 't1' && c.data?.body)
    .map(c => {
      const d = c.data;
      const replies = d.replies?.data?.children
        ? extractComments(d.replies.data.children, maxDepth, currentDepth + 1)
        : [];

      return {
        author: d.author || '[deleted]',
        score: d.score || 0,
        body: d.body || '',
        timestamp: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : '',
        depth: currentDepth,
        ...(replies.length > 0 ? { replies } : {}),
      };
    });
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.url) {
    console.error('Usage: node reddit-thread.mjs <reddit-url> [options]');
    process.exit(1);
  }

  const maxDepth = parseInt(args.depth || '3', 10);
  const limit = parseInt(args.limit || '50', 10);
  const timeout = parseInt(args.timeout || '30000', 10);
  const jsonUrl = toJsonUrl(args.url) + `?limit=${limit}`;

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.includes('.json') || url.includes('reddit.com/api')) return route.continue();
      return route.abort();
    });

    await page.goto(jsonUrl, { waitUntil: 'domcontentloaded', timeout });
    const text = await page.locator('body').textContent();
    const data = JSON.parse(text);

    // data[0] = post, data[1] = comments
    const postData = data[0]?.data?.children?.[0]?.data || {};
    const post = {
      title: postData.title || '',
      author: postData.author || '',
      score: postData.score || 0,
      body: postData.selftext || '',
      url: postData.url || '',
      subreddit: postData.subreddit_name_with_prefix || '',
      permalink: `https://www.reddit.com${postData.permalink || ''}`,
      timestamp: postData.created_utc ? new Date(postData.created_utc * 1000).toISOString() : '',
      commentCount: postData.num_comments || 0,
    };

    const commentChildren = data[1]?.data?.children || [];
    const comments = extractComments(commentChildren, maxDepth);

    const result = { post, comments, commentCount: comments.length };

    if (args.format === 'text') {
      console.log(`# ${post.title}`);
      console.log(`by u/${post.author} | ${post.score} points | ${post.subreddit}`);
      if (post.body) console.log(`\n${post.body}`);
      console.log(`\n--- ${comments.length} comments ---\n`);

      function printComment(c, indent = '') {
        console.log(`${indent}u/${c.author} (${c.score} pts)`);
        console.log(`${indent}${c.body.slice(0, 500)}`);
        console.log('');
        if (c.replies) {
          for (const r of c.replies) printComment(r, indent + '  ');
        }
      }
      for (const c of comments) printComment(c);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }

  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
