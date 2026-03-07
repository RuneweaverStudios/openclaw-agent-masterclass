#!/usr/bin/env node
/**
 * x-profile.mjs — Scrape an X/Twitter profile and recent posts
 *
 * IMPORTANT: X requires authentication. Run auth-flow.mjs first to save session state.
 *
 * Usage:
 *   node x-profile.mjs <handle> --auth x-auth.json [options]
 *
 * Options:
 *   --auth <path>          Auth state file (REQUIRED)
 *   --limit <n>            Max posts to extract (default: 20)
 *   --format <type>        json|text (default: json)
 *   --replies              Include replies (default: only original tweets)
 *   --timeout <ms>         Timeout (default: 30000)
 *   --scroll <n>           Scroll iterations (default: 3)
 *
 * Examples:
 *   node x-profile.mjs elonmusk --auth x-auth.json
 *   node x-profile.mjs openai --auth x-auth.json --limit 50 --format text
 *   node x-profile.mjs naval --auth x-auth.json --replies
 */

import { chromium } from 'playwright';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      if (!args.handle) args.handle = arg.replace('@', '');
      i++; continue;
    }
    const key = arg.slice(2);
    if (key === 'replies') { args.replies = true; i++; continue; }
    args[key] = argv[++i]; i++;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.handle) {
    console.error('Usage: node x-profile.mjs <handle> --auth x-auth.json [options]');
    process.exit(1);
  }
  if (!args.auth) {
    console.error('Error: --auth is required. Run auth-flow.mjs first.');
    process.exit(1);
  }

  const limit = parseInt(args.limit || '20', 10);
  const timeout = parseInt(args.timeout || '30000', 10);
  const scrollCount = parseInt(args.scroll || '3', 10);

  const tabPath = args.replies ? '/with_replies' : '';
  const profileUrl = `https://x.com/${args.handle}${tabPath}`;

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      storageState: args.auth,
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout });

    // Wait for profile to load
    await page.waitForSelector('[data-testid="UserName"]', { timeout }).catch(() => {});

    // Extract profile info
    const profile = await page.evaluate(() => {
      const nameEl = document.querySelector('[data-testid="UserName"]');
      const bioEl = document.querySelector('[data-testid="UserDescription"]');
      const locationEl = document.querySelector('[data-testid="UserLocation"]');
      const urlEl = document.querySelector('[data-testid="UserUrl"]');

      // Parse follower counts from the profile header
      const links = document.querySelectorAll('a[href*="/verified_followers"], a[href*="/followers"], a[href*="/following"]');
      let followers = '', following = '';
      links.forEach(link => {
        const text = link.textContent.trim();
        if (link.href.includes('/following')) following = text;
        else if (link.href.includes('/followers') || link.href.includes('/verified_followers')) followers = text;
      });

      return {
        name: nameEl?.querySelector('span')?.textContent?.trim() || '',
        handle: nameEl?.textContent?.match(/@(\w+)/)?.[1] || '',
        bio: bioEl?.textContent?.trim() || '',
        location: locationEl?.textContent?.trim() || '',
        website: urlEl?.textContent?.trim() || '',
        followers: followers || '0',
        following: following || '0',
      };
    });

    // Scroll to load more tweets
    for (let s = 0; s < scrollCount; s++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);
    }

    // Extract posts
    const posts = await page.$$eval('article[data-testid="tweet"]', (elements, lim) => {
      return elements.slice(0, lim).map(el => {
        const textEl = el.querySelector('[data-testid="tweetText"]');
        const timeEl = el.querySelector('time');
        const linkEl = el.querySelector('a[href*="/status/"]');

        const metrics = {};
        const groups = el.querySelectorAll('[role="group"] button');
        const metricNames = ['replies', 'retweets', 'likes', 'views'];
        groups.forEach((btn, i) => {
          const val = btn.querySelector('span[data-testid]')?.textContent?.trim() ||
                      btn.textContent?.trim()?.match(/[\d,.KkMm]+/)?.[0] || '0';
          if (metricNames[i]) metrics[metricNames[i]] = val;
        });

        return {
          text: textEl?.textContent?.trim() || '',
          timestamp: timeEl?.getAttribute('datetime') || '',
          url: linkEl ? `https://x.com${linkEl.getAttribute('href')}` : '',
          ...metrics,
        };
      });
    }, limit);

    const result = { profile, posts, postCount: posts.length };

    if (args.format === 'text') {
      console.log(`${profile.name} (@${profile.handle})`);
      console.log(`${profile.bio}`);
      console.log(`📍 ${profile.location} | 🔗 ${profile.website}`);
      console.log(`${profile.followers} followers | ${profile.following} following`);
      console.log(`\n--- ${posts.length} posts ---\n`);
      for (const p of posts) {
        console.log(p.text);
        console.log(`♥ ${p.likes || 0}  ↻ ${p.retweets || 0}  💬 ${p.replies || 0}`);
        console.log(p.url);
        console.log('');
      }
    } else {
      console.log(JSON.stringify(result, null, 2));
    }

  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
