#!/usr/bin/env node
/**
 * campaign.mjs — Generate and schedule a multi-platform content campaign
 *
 * Usage:
 *   node campaign.mjs --config charlie/config.json --days <n> [options]
 *
 * Options:
 *   --days <n>          Days of content to generate (default: 7)
 *   --posts-per-day <n> Posts per day (default: 3)
 *   --platforms <list>  Comma-separated platforms (default: all configured)
 *   --hooks <path>      Hook library JSON
 *   --dry-run           Generate plan without posting
 *   --out <dir>         Output directory for plan
 *
 * Output: Content calendar JSON with hooks, platforms, times, and status
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { i++; continue; }
    const key = arg.slice(2);
    if (key === 'dry-run') { args.dryRun = true; i++; continue; }
    args[key] = argv[++i]; i++;
  }
  return args;
}

const HOOK_CATEGORIES = [
  'achievement', 'curiosity', 'controversy', 'tutorial', 'story', 'trend',
];

const PLATFORM_FORMATS = {
  tiktok: { maxLength: 2200, format: 'slideshow', slides: 6, hashtags: 5 },
  x: { maxLength: 280, format: 'tweet-or-thread', hashtags: 3 },
  reddit: { maxLength: 40000, format: 'text-post', hashtags: 0 },
  youtube: { maxLength: 5000, format: 'short', hashtags: 15 },
  instagram: { maxLength: 2200, format: 'carousel', slides: 10, hashtags: 30 },
};

function generateCalendar(config, days, postsPerDay, hooks) {
  const schedule = config.posting?.schedule || ['08:00', '12:30', '18:00'];
  const platforms = Object.keys(config.platforms || {});
  const calendar = [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start tomorrow

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    for (let p = 0; p < Math.min(postsPerDay, schedule.length); p++) {
      // Rotate through hook categories
      const categoryIdx = (d * postsPerDay + p) % HOOK_CATEGORIES.length;
      const category = HOOK_CATEGORIES[categoryIdx];

      // Pick best unused hook from category, or flag for generation
      const categoryHooks = (hooks || []).filter(h => h.category === category && h.uses < 3);
      categoryHooks.sort((a, b) => (b.score || 0) - (a.score || 0));
      const hook = categoryHooks[0] || { hook: `[GENERATE: ${category} hook]`, category, score: 0, uses: 0 };

      // Rotate platforms for variety
      const platform = platforms[p % platforms.length] || 'tiktok';
      const format = PLATFORM_FORMATS[platform] || PLATFORM_FORMATS.tiktok;

      calendar.push({
        date: dateStr,
        time: schedule[p],
        platform,
        hook: hook.hook,
        category,
        format: format.format,
        status: 'planned',
        integrationId: config.platforms?.[platform] || '',
        notes: hook.hook.startsWith('[GENERATE') ? 'NEEDS HOOK — generate before posting' : '',
      });
    }
  }

  return calendar;
}

async function main() {
  const args = parseArgs(process.argv);
  const configPath = args.config || 'charlie/config.json';

  if (!existsSync(configPath)) {
    console.error(`Config not found: ${configPath}. Run Charlie's onboarding first.`);
    process.exit(1);
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const days = parseInt(args.days || '7', 10);
  const postsPerDay = parseInt(args['posts-per-day'] || '3', 10);

  // Load hook library if available
  let hooks = [];
  const hooksPath = args.hooks || 'charlie/hooks.json';
  if (existsSync(hooksPath)) {
    hooks = JSON.parse(readFileSync(hooksPath, 'utf-8'));
  }

  const calendar = generateCalendar(config, days, postsPerDay, hooks);

  const outDir = args.out || 'charlie/campaigns';
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const outPath = join(outDir, `campaign-${new Date().toISOString().split('T')[0]}.json`);
  writeFileSync(outPath, JSON.stringify(calendar, null, 2));

  // Summary
  const platforms = [...new Set(calendar.map(c => c.platform))];
  const needsHooks = calendar.filter(c => c.notes.includes('NEEDS HOOK')).length;

  console.log(JSON.stringify({
    totalPosts: calendar.length,
    days,
    postsPerDay,
    platforms,
    needsHookGeneration: needsHooks,
    calendarPath: outPath,
    dryRun: !!args.dryRun,
  }, null, 2));

  if (!args.dryRun) {
    console.error(`\n✅ Campaign planned: ${calendar.length} posts over ${days} days`);
    console.error(`   ${needsHooks} posts need hooks generated`);
    console.error(`   Saved to: ${outPath}`);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
