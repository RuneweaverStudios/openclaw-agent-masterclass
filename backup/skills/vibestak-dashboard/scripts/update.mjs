#!/usr/bin/env node
/**
 * Update metrics
 * Usage: node update.mjs --type followers --platform x --count 100
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = '~/.openclaw/workspace/skills/vibestak-dashboard/data';

const args = process.argv.slice(2);
const updates = {};

for (let i = 0; i < args.length; i += 2) {
  if (args[i] === '--type' && args[i+1]) updates.type = args[++i];
  else if (args[i] === '--platform' && args[i+1]) updates.platform = args[++i];
  else if (args[i] === '--count' && args[i+1]) updates.count = parseInt(args[++i]);
}

const metricsPath = join(DATA_DIR, 'metrics.json');
let metrics = { followers: {}, revenue: {}, waitlist: 0 };

try {
  metrics = JSON.parse(readFileSync(metricsPath, 'utf-8'));
} catch {}

// Update
if (updates.type === 'followers' && updates.platform) {
  metrics.followers[updates.platform] = updates.count || 0;
}
if (updates.type === 'mrr') {
  metrics.revenue.mrr = updates.count || 0;
}
if (updates.type === 'waitlist') {
  metrics.waitlist = updates.count || 0;
}
if (updates.type === 'sales') {
  metrics.revenue.dailySales = updates.count || 0;
}

metrics.lastUpdated = new Date().toISOString();
writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));

console.log('✅ Updated:', JSON.stringify(updates));
