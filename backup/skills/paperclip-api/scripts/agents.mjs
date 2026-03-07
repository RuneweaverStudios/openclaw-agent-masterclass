#!/usr/bin/env node
/**
 * PaperClip Agents - Create and manage agents
 * Usage: node agents.mjs [command] [options]
 * 
 * Options:
 *   --company <id>  Company ID (or use default)
 *   --name <name>   Agent name
 *   --role <role>   Agent role/title
 *   --adapter <type> Adapter: claude_local, openclaw, codex_local, process, http
 *   --working-dir   Working directory for agent
 */

const API = 'http://localhost:3100/api';
const COMPANY_ID = '6b2f06a5-ce52-43f3-865d-7f7b53be45fc'; // VIB

// Parse args
const args = process.argv.slice(2);
let cmd = args[0];
const opts = {};
for (let i = 1; i < args.length; i += 2) {
  if (args[i] === '--company') opts.company = args[i + 1];
  if (args[i] === '--name') opts.name = args[i + 1];
  if (args[i] === '--role') opts.role = args[i + 1];
  if (args[i] === '--adapter') opts.adapter = args[i + 1];
  if (args[i] === '--working-dir') opts.workingDir = args[i + 1];
}

const companyId = opts.company || COMPANY_ID;

const commands = {
  list: async () => {
    const res = await fetch(`${API}/companies/${companyId}/agents`);
    const agents = await res.json();
    console.log(`Agents in ${companyId}:`);
    if (agents.length === 0) {
      console.log('  (none)');
    } else {
      agents.forEach(a => {
        console.log(`  ${a.name} - ${a.title || 'No title'}`);
        console.log(`    Status: ${a.status}`);
        console.log(`    Adapter: ${a.adapterType}`);
        console.log(`    ID: ${a.id}`);
        console.log('');
      });
    }
  },
  
  create: async () => {
    if (!opts.name) {
      console.log('Error: --name required');
      process.exit(1);
    }
    
    const agent = {
      name: opts.name,
      title: opts.role || `${opts.name} role`,
      adapterType: opts.adapter || 'claude_local',
      workingDirectory: opts.workingDir || '~/.openclaw/workspace',
      promptTemplate: `You are ${opts.name}. ${opts.role || 'You work for the company.'}`,
      command: opts.adapter === 'openclaw' ? 'curl' : 'claude',
      maxTurnsPerRun: 80,
      enableChrome: false,
      skipPermissions: false,
    };
    
    const res = await fetch(`${API}/companies/${companyId}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent)
    });
    
    if (res.ok) {
      const created = await res.json();
      console.log(`✅ Created agent: ${created.name} (${created.id})`);
    } else {
      const err = await res.text();
      console.log(`❌ Error: ${err}`);
    }
  },
  
  delete: async (agentId) => {
    const res = await fetch(`${API}/companies/${companyId}/agents/${agentId}`, {
      method: 'DELETE'
    });
    console.log(res.ok ? '✅ Deleted' : '❌ Error');
  }
};

if (commands[cmd]) {
  commands[cmd](arg => args[args.indexOf('--company') + 1]);
} else {
  console.log('Usage: node agents.mjs [command] [options]');
  console.log('');
  console.log('Commands:');
  console.log('  list                          List agents');
  console.log('  create --name X --role Y     Create agent');
  console.log('  delete <id>                  Delete agent');
  console.log('');
  console.log('Options:');
  console.log('  --company <id>   Company ID');
  console.log('  --name <name>    Agent name');
  console.log('  --role <role>    Agent role/title');
  console.log('  --adapter <type> claude_local, openclaw, codex_local, process, http');
  console.log('  --working-dir    Working directory');
  console.log('');
  console.log('Example:');
  console.log('  node agents.mjs create --name Charlie --role "Marketing Agent" --adapter process');
}
