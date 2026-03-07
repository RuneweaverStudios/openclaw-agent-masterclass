#!/usr/bin/env node
/**
 * Capture - Auto-detect REST API or direct PostgreSQL
 * Usage: node capture.mjs "Your thought" [--topics "topic1,topic2"] [--importance high]
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Check if we have PostgreSQL connection
const hasPostgres = existsSync(resolve(__dirname, '../.env')) && 
  process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes('supabase.co');

// Use REST API by default (more reliable with Supabase)
const script = hasPostgres ? 'capture-direct.mjs' : 'capture-rest.mjs';

// Spawn the appropriate script
const child = spawn('node', [resolve(__dirname, script), ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('❌ Failed to run capture:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
