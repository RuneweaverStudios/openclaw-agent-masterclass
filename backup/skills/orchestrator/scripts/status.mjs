#!/usr/bin/env node
/**
 * Orchestrator Status - List all subagents
 */

import { execSync } from 'child_process';

const formatRuntime = (ms) => {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m${secs}s`;
};

const formatTokens = (tokens) => {
  if (tokens > 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens;
};

try {
  const result = execSync('openclaw subagents list --json 2>/dev/null', {
    encoding: 'utf8',
    timeout: 10000
  });
  
  const data = JSON.parse(result);
  
  if (!data.active || data.active.length === 0) {
    console.log('No active subagents');
    console.log('\nRecent (last 30m):', data.recent?.length || 0);
    process.exit(0);
  }
  
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║  ACTIVE SUBAGENTS                                                    ║');
  console.log('╠══════════════════════════════════════════════════════════════════════╣');
  
  data.active.forEach((agent, i) => {
    const runtime = formatRuntime(agent.runtimeMs);
    const tokens = formatTokens(agent.totalTokens);
    const task = agent.task?.substring(0, 50) || 'No task';
    const status = agent.status === 'running' ? '✅' : '⏸️';
    
    console.log(`║ ${status} ${agent.label || 'unnamed'}`);
    console.log(`║   Runtime: ${runtime} | Tokens: ${tokens} | Model: ${agent.model}`);
    console.log(`║   Task: ${task}...`);
    console.log(`║   Key: ${agent.sessionKey?.substring(0, 40)}...`);
    console.log('║');
  });
  
  console.log('╠══════════════════════════════════════════════════════════════════════╣');
  console.log(`║  Recent: ${data.recent?.length || 0} | Total: ${data.total || data.active.length}`);
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  
  // Output JSON for piping
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(data, null, 2));
  }
  
} catch (error) {
  console.error('Error fetching subagents:', error.message);
  process.exit(1);
}
