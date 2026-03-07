#!/usr/bin/env node
/**
 * Orchestrator Health - Check agent health
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = join(__dirname, '..', 'registry.json');

const STUCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

console.log('\n🏥 Agent Health Check\n');

try {
  // Get current subagents
  const result = execSync('openclaw subagents list --json 2>/dev/null', {
    encoding: 'utf8',
    timeout: 10000
  });
  
  const data = JSON.parse(result);
  const active = data.active || [];
  
  if (active.length === 0) {
    console.log('✅ No active agents\n');
    process.exit(0);
  }
  
  const now = Date.now();
  const issues = [];
  
  active.forEach(agent => {
    const runtime = agent.runtimeMs;
    const status = agent.status;
    const label = agent.label || 'unnamed';
    
    let icon = '✅';
    let issue = null;
    
    // Check for stuck (running too long)
    if (runtime > STUCK_THRESHOLD_MS) {
      icon = '⚠️';
      issue = 'STUCK';
      issues.push({ ...agent, issue: 'stuck' });
    }
    
    // Check for failed status
    if (status === 'failed' || status === 'error') {
      icon = '❌';
      issue = 'FAILED';
      issues.push({ ...agent, issue: 'failed' });
    }
    
    const mins = Math.floor(runtime / 60000);
    console.log(`${icon} ${label} | ${mins}m | ${status} ${issue || ''}`);
  });
  
  if (issues.length > 0) {
    console.log(`\n⚠️  ${issues.length} agent(s) need attention`);
    console.log('Run: node restart-stuck.mjs');
  } else {
    console.log('\n✅ All agents healthy');
  }
  
  // Output JSON for piping
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ active, issues }, null, 2));
  }
  
} catch (error) {
  console.error('Error checking health:', error.message);
  process.exit(1);
}
