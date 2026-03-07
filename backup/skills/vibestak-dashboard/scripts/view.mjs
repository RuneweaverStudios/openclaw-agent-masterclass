#!/usr/bin/env node
/**
 * Dashboard - View all business metrics
 * Usage: node view.mjs
 */

import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = '~/.openclaw/workspace/skills/vibestak-dashboard/data';
const SCHEDULE_FILE = '~/.openclaw/workspace/SCHEDULE.md';

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

function getData(filename, defaults = {}) {
  const path = join(DATA_DIR, filename);
  if (existsSync(path)) {
    try { return JSON.parse(readFileSync(path, 'utf-8')); } 
    catch { return defaults; }
  }
  return defaults;
}

function main() {
  const goals = getData('goals.json', {
    longTerm: { target: '$40K MRR', by: 'December 2026' },
    monthly: [
      { month: 'March', target: 1000, actual: 0 },
      { month: 'April', target: 3000, actual: 0 },
      { month: 'May', target: 5000, actual: 0 }
    ]
  });

  const metrics = getData('metrics.json', {
    followers: { x: 0, tiktok: 0, youtube: 0, reddit: 0 },
    revenue: { mrr: 0, dailySales: 0 },
    waitlist: 1,
    lastUpdated: new Date().toISOString()
  });

  const kanban = getData('kanban.json', {
    todo: ['Launch Details Course', 'Set up Stripe checkout', 'Create first tutorial'],
    inProgress: ['Build VibeStack OS'],
    done: ['Launch vibestak.com', 'Connect Supabase waitlist'],
    blocked: [],
    accelerating: ['Content engine running', 'GitHub spotlight active']
  });

  const history = getData('history.json', []);

  console.log('\n📊 ════════════════════════════════════════════');
  console.log('   VIBESTAK BUSINESS DASHBOARD');
  console.log('═══════════════════════════════════════════\n');

  // GOALS
  console.log('🎯 GOALS');
  console.log('───────────────────────────────────────────');
  console.log(`   Long-term: ${goals.longTerm.target} by ${goals.longTerm.by}`);
  console.log('   Monthly:');
  goals.monthly.forEach(m => {
    const pct = m.actual / m.target * 100;
    console.log(`     ${m.month}: $${m.actual} / $${m.target} (${pct.toFixed(0)}%)`);
  });
  console.log('');

  // METRICS
  console.log('📈 METRICS');
  console.log('───────────────────────────────────────────');
  console.log(`   Waitlist: ${metrics.waitlist} signups`);
  console.log(`   MRR: $${metrics.revenue.mrr}`);
  console.log(`   Daily Sales: $${metrics.revenue.dailySales}`);
  console.log('   Followers:');
  console.log(`     X/Twitter: ${metrics.followers.x}`);
  console.log(`     TikTok: ${metrics.followers.tiktok}`);
  console.log(`     YouTube: ${metrics.followers.youtube}`);
  console.log(`     Reddit: ${metrics.followers.reddit}`);
  console.log('');

  // KANBAN
  console.log('📋 KANBAN');
  console.log('───────────────────────────────────────────');
  console.log('   🚫 BLOCKED (Headwinds):');
  kanban.blocked.forEach(i => console.log(`     - ${i}`));
  if (kanban.blocked.length === 0) console.log('     (none)');
  console.log('   ⏳ TO DO:');
  kanban.todo.forEach(i => console.log(`     - ${i}`));
  if (kanban.todo.length === 0) console.log('     (none)');
  console.log('   🔄 IN PROGRESS:');
  kanban.inProgress.forEach(i => console.log(`     - ${i}`));
  if (kanban.inProgress.length === 0) console.log('     (none)');
  console.log('   🚀 ACCELERATING (Tailwinds):');
  kanban.accelerating.forEach(i => console.log(`     - ${i}`));
  if (kanban.accelerating.length === 0) console.log('     (none)');
  console.log('   ✅ DONE:');
  kanban.done.slice(-5).forEach(i => console.log(`     - ${i}`));
  if (kanban.done.length === 0) console.log('     (none)');
  console.log('');

  // RECENT HISTORY
  console.log('📜 RECENT HISTORY');
  console.log('───────────────────────────────────────────');
  history.slice(-5).reverse().forEach(h => {
    console.log(`   ${h.date}: ${h.event}`);
  });
  if (history.length === 0) console.log('   (none yet)');

  console.log('\n═══════════════════════════════════════════\n');
  console.log(`   Last updated: ${metrics.lastUpdated}`);
  console.log('');
}

main();
