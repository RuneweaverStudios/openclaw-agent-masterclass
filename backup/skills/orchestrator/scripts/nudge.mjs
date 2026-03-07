#!/usr/bin/env node
/**
 * Orchestrator Nudge - Send message to running agent
 * 
 * Usage: node nudge.mjs <sessionKey> "message"
 */

const args = process.argv.slice(2);
const sessionKey = args[0];
const message = args.slice(1).join(' ');

if (!sessionKey || !message) {
  console.log('Usage: node nudge.mjs <sessionKey> "message"');
  process.exit(1);
}

console.log(`\n📮 Nudging agent: ${sessionKey.substring(0, 40)}...`);
console.log(`   Message: ${message}`);

console.log('\n💡 Use subagents tool with:');
console.log(JSON.stringify({
  action: 'steer',
  target: sessionKey,
  message
}, null, 2));
