#!/usr/bin/env node
/**
 * Orchestrator Kill - Terminate agent
 * 
 * Usage: node kill.mjs <sessionKey>
 */

const args = process.argv.slice(2);
const sessionKey = args[0];

if (!sessionKey) {
  console.log('Usage: node kill.mjs <sessionKey>');
  process.exit(1);
}

console.log(`\n☠️ Killing agent: ${sessionKey.substring(0, 40)}...`);

console.log('\n💡 Use subagents tool with:');
console.log(JSON.stringify({
  action: 'kill',
  target: sessionKey
}, null, 2));
