#!/usr/bin/env node
/**
 * Daily Review - End of day summary
 * Runs at midnight to extract learnings and save to memory
 */

import { readFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const LOG_DIR = '~/.openclaw/workspace/logs';
const MEMORY_FILE = '~/.openclaw/workspace/MEMORY.md';

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function main() {
  const today = new Date().toISOString().split('T')[0];
  log('🌙 Daily Review starting...');
  
  let summary = `## ${today}\n\n`;
  
  // Read all log files
  const logFiles = [
    'content-engine.log',
    'github-spotlight.log', 
    'daily-ops.log'
  ];
  
  for (const file of logFiles) {
    try {
      const path = join(LOG_DIR, file);
      if (existsSync(path)) {
        const content = readFileSync(path, 'utf-8');
        const lines = content.split('\n').filter(l => l.includes(today) || l.includes('2026-03'));
        if (lines.length > 0) {
          summary += `### ${file.replace('.log', '')}\n`;
          summary += lines.slice(-5).join('\n') + '\n\n';
        }
      }
    } catch (e) {
      // Skip if can't read
    }
  }
  
  // Extract key metrics
  summary += '### Metrics\n';
  
  try {
    // Waitlist count
    const { Client } = require('pg');
    const client = new Client({
      connectionString: 'postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres'
    });
    client.connect();
    client.query('SELECT COUNT(*) FROM waitlist').then(r => {
      summary += `- Waitlist: ${r.rows[0].count} signups\n`;
      client.end();
    });
  } catch (e) {}
  
  // Append to memory
  try {
    const existing = readFileSync(MEMORY_FILE, 'utf-8');
    const newContent = existing + '\n' + summary;
    require('fs').writeFileSync(MEMORY_FILE, newContent);
    log('✅ Saved to MEMORY.md');
  } catch (e) {
    log('Error saving to memory:', e.message);
  }
  
  log('✅ Daily review complete!');
}

main();
