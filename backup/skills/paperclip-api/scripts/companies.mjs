#!/usr/bin/env node
/**
 * PaperClip Companies - API wrapper
 * Usage: node companies.mjs [command]
 */

const API = 'http://localhost:3100/api';

const commands = {
  list: async () => {
    const res = await fetch(`${API}/companies`);
    const data = await res.json();
    console.log('Companies:');
    data.forEach(c => {
      console.log(`  ${c.issuePrefix} - ${c.name} (${c.status})`);
      console.log(`    ID: ${c.id}`);
      console.log(`    Issues: ${c.issueCounter}`);
      console.log(`    Budget: $${c.budgetMonthlyCents / 100}/mo`);
      console.log('');
    });
  },
  info: async (id) => {
    const res = await fetch(`${API}/companies/${id}`);
    const c = await res.json();
    console.log(JSON.stringify(c, null, 2));
  }
};

const cmd = process.argv[2];
const arg = process.argv[3];

if (commands[cmd]) {
  commands[cmd](arg);
} else {
  console.log('Usage: node companies.mjs [command]');
  console.log('Commands: list, info <id>');
}
