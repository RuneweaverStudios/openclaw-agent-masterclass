#!/usr/bin/env node
/**
 * Calendar - View scheduled events and cron history
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LOG_DIR = '~/.openclaw/workspace/logs';
const DATA_DIR = '~/.openclaw/workspace/skills/vibestak-dashboard/data';

console.log('\n📅 ════════════════════════════════════════════');
console.log('   VIBESTAK CALENDAR & CRONS');
console.log('═══════════════════════════════════════════\n');

// Cron schedule
console.log('⏰ CRON SCHEDULE');
console.log('───────────────────────────────────────────');
console.log('   8am   - daily-ops (revenue, waitlist)');
console.log('   9am   - github-spotlight');
console.log('   12pm  - charlie content check');
console.log('   3pm   - content-engine');
console.log('   6pm   - charlie content check');
console.log('   9pm   - content-engine');
console.log('   12am  - daily-review → memory');
console.log('');

// Recent cron runs
console.log('📜 RECENT ACTIVITY');
console.log('───────────────────────────────────────────');

const logFiles = ['content-engine.log', 'github-spotlight.log', 'daily-ops.log'];
for (const file of logFiles) {
  try {
    const path = join(LOG_DIR, file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      const lines = content.split('\n').filter(l => l.includes('starting') || l.includes('complete') || l.includes('Error'));
      if (lines.length > 0) {
        console.log(`   ${file}:`);
        lines.slice(-3).forEach(l => console.log(`     ${l.slice(0,80)}`));
      }
    }
  } catch {}
}

console.log('\n═══════════════════════════════════════════\n');
