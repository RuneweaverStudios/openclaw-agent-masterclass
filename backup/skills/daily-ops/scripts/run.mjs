#!/usr/bin/env node
/**
 * Daily Operations - Morning Report
 * Runs every morning to give status update
 * 
 * Usage: node daily-ops.mjs
 */

import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const LOG_DIR = '~/.openclaw/workspace/logs';
const SKILLS_DIR = '~/.openclaw/workspace/skills';

if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

function log(msg) {
  const ts = new Date().toISOString();
  appendFileSync(join(LOG_DIR, 'daily-ops.log'), `[${ts}] ${msg}\n`);
  console.log(msg);
}

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 30000, cwd: SKILLS_DIR }).trim();
  } catch { return null; }
}

async function main() {
  log('🌅 Daily Operations Report\n');
  
  // 1. Waitlist
  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: 'postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres'
    });
    await client.connect();
    const result = await client.query('SELECT COUNT(*) FROM waitlist');
    log(`📧 Waitlist: ${result.rows[0].count} signups`);
    client.end();
  } catch (e) {
    log('📧 Waitlist: error');
  }
  
  // 2. Revenue
  try {
    const revenue = runCmd(`node ${SKILLS_DIR}/vibestak-billing/scripts/revenue.mjs`);
    const mrrMatch = revenue?.match(/MRR:\s*\$\d+/);
    if (mrrMatch) log(`💰 ${mrrMatch[0]}`);
  } catch { log('💰 Revenue: error'); }
  
  // 3. Content pending
  const pendingContent = runCmd(`ls ${SKILLS_DIR}/content-engine/pending 2>/dev/null | wc -l`);
  const pendingSpotlight = runCmd(`ls ${SKILLS_DIR}/github-spotlight/pending 2>/dev/null | wc -l`);
  log(`📝 Content pending: ${pendingContent || 0} posts, ${pendingSpotlight || 0} spotlights`);
  
  // 4. Recent posts (from logs)
  log(`\n✅ Daily report complete`);
}

main();
