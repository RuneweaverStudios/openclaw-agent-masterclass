#!/usr/bin/env node
/**
 * Orchestrator Restart Stuck - Auto-restart failed/stuck agents
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = join(__dirname, '..', 'registry.json');

const STUCK_THRESHOLD_MS = 10 * 60 * 1000;
const MAX_RESTARTS = 3;

console.log('\n🔄 Checking for stuck/failed agents...\n');

try {
  // Get current subagents
  const result = execSync('openclaw subagents list --json 2>/dev/null', {
    encoding: 'utf8',
    timeout: 10000
  });
  
  const data = JSON.parse(result);
  const active = data.active || [];
  
  // Load registry
  let registry = { agents: [] };
  if (existsSync(REGISTRY_PATH)) {
    registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  }
  
  const toRestart = [];
  
  active.forEach(agent => {
    if (agent.runtimeMs > STUCK_THRESHOLD_MS || agent.status === 'failed') {
      // Check restart count
      const regAgent = registry.agents.find(a => a.label === agent.label);
      const restarts = regAgent?.restarts || 0;
      
      if (restarts < MAX_RESTARTS) {
        toRestart.push({
          ...agent,
          originalTask: regAgent?.task || agent.task,
          config: regAgent?.config,
          restarts
        });
      } else {
        console.log(`❌ ${agent.label} - Max restarts reached (${restarts})`);
      }
    }
  });
  
  if (toRestart.length === 0) {
    console.log('✅ No agents need restart\n');
    process.exit(0);
  }
  
  console.log(`🔄 Restarting ${toRestart.length} agent(s)...\n`);
  
  toRestart.forEach(agent => {
    console.log(`\n📦 ${agent.label}:`);
    console.log(`   Restarts: ${agent.restarts} → ${agent.restarts + 1}`);
    console.log(`   Task: ${agent.originalTask?.substring(0, 60)}...`);
    
    // Kill old agent
    try {
      execSync(`openclaw subagents kill ${agent.sessionKey} 2>/dev/null`, { timeout: 5000 });
      console.log('   ☠️ Killed old agent');
    } catch (e) {
      console.log('   ⚠️ Kill failed (may already be dead)');
    }
    
    // Output spawn config for main agent
    if (agent.config) {
      console.log('\n   💡 Respawn with:');
      console.log(JSON.stringify({
        ...agent.config,
        label: `${agent.label}-r${agent.restarts + 1}`
      }, null, 2));
    }
    
    // Update registry
    const regIndex = registry.agents.findIndex(a => a.label === agent.label);
    if (regIndex >= 0) {
      registry.agents[regIndex].restarts = (registry.agents[regIndex].restarts || 0) + 1;
      registry.agents[regIndex].status = 'restarting';
    }
  });
  
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log('\n✅ Registry updated');
  
} catch (error) {
  console.error('Error restarting agents:', error.message);
  process.exit(1);
}
