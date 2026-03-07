#!/usr/bin/env node
/**
 * PaperClip Issues - Create and manage tasks
 * Usage: node issues.mjs [command]
 */

const API = 'http://localhost:3100/api';
const COMPANY_ID = '6b2f06a5-ce52-43f3-865d-7f7b53be45fc';

const args = process.argv.slice(2);
let cmd = args[0];
const opts = {};
for (let i = 1; i < args.length; i += 2) {
  if (args[i] === '--title') opts.title = args[i + 1];
  if (args[i] === '--description') opts.description = args[i + 1];
  if (args[i] === '--agent-id') opts.agentId = args[i + 1];
  if (args[i] === '--priority') opts.priority = args[i + 1];
}

const commands = {
  list: async () => {
    const res = await fetch(`${API}/companies/${COMPANY_ID}/issues`);
    const issues = await res.json();
    console.log('Issues:');
    if (issues.length === 0) console.log('  (none)');
    issues.forEach(i => {
      console.log(`  [${i.status}] ${i.title}`);
      console.log(`    ID: ${i.id}, Priority: ${i.priority}`);
      console.log('');
    });
  },
  
  create: async () => {
    if (!opts.title) {
      console.log('Error: --title required');
      process.exit(1);
    }
    
    const issue = {
      title: opts.title,
      description: opts.description || '',
      priority: opts.priority || 'medium'
    };
    
    const res = await fetch(`${API}/companies/${COMPANY_ID}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue)
    });
    
    if (res.ok) {
      const created = await res.json();
      console.log(`✅ Created issue: ${created.title} (${created.id})`);
    } else {
      console.log(`❌ Error: ${await res.text()}`);
    }
  }
};

if (commands[cmd]) {
  commands[cmd]();
} else {
  console.log('Usage: node issues.mjs [command]');
  console.log('Commands: list, create');
}
