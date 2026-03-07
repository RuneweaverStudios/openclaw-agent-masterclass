#!/usr/bin/env node
/**
 * Orchestrator Spawn - Create agent from template
 * 
 * Usage: node spawn.mjs <template> --task "task description" [--label "name"] [--timeout 600]
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = join(__dirname, '..', 'registry.json');
const TEMPLATES_PATH = join(__dirname, '..', 'templates');

const TEMPLATES = {
  coding: {
    runtime: 'subagent',
    model: 'zai/glm-5',
    timeoutSeconds: 600,
    thinking: 'medium',
    description: 'Spawns Claude Code for coding tasks'
  },
  research: {
    runtime: 'subagent',
    model: 'zai/glm-5',
    timeoutSeconds: 300,
    thinking: 'medium',
    description: 'Web research and summarization'
  },
  marketing: {
    runtime: 'subagent',
    model: 'zai/glm-5',
    timeoutSeconds: 600,
    thinking: 'medium',
    description: 'Content creation and social media'
  },
  visual: {
    runtime: 'subagent',
    model: 'zai/glm-5',
    timeoutSeconds: 600,
    thinking: 'medium',
    description: 'Diagrams, videos, visual explainers'
  }
};

const args = process.argv.slice(2);
const templateName = args[0];

if (!templateName || !TEMPLATES[templateName]) {
  console.log('Usage: node spawn.mjs <template> --task "task" [--label "name"] [--timeout 600]');
  console.log('\nTemplates:', Object.keys(TEMPLATES).join(', '));
  process.exit(1);
}

const taskIndex = args.indexOf('--task');
const labelIndex = args.indexOf('--label');
const timeoutIndex = args.indexOf('--timeout');

if (taskIndex === -1 || !args[taskIndex + 1]) {
  console.error('Error: --task is required');
  process.exit(1);
}

const task = args[taskIndex + 1];
const label = labelIndex !== -1 ? args[labelIndex + 1] : `${templateName}-${Date.now()}`;
const timeout = timeoutIndex !== -1 ? parseInt(args[timeoutIndex + 1]) : TEMPLATES[templateName].timeoutSeconds;

const template = TEMPLATES[templateName];

console.log(`\n🚀 Spawning ${templateName} agent...`);
console.log(`   Label: ${label}`);
console.log(`   Task: ${task.substring(0, 60)}...`);
console.log(`   Timeout: ${timeout}s`);

// Output spawn config as JSON for the main agent to use
const spawnConfig = {
  runtime: template.runtime,
  model: template.model,
  task,
  label,
  timeoutSeconds: timeout,
  thinking: template.thinking
};

console.log('\n📋 Spawn Config:');
console.log(JSON.stringify(spawnConfig, null, 2));

// Update registry
let registry = { agents: [] };
if (existsSync(REGISTRY_PATH)) {
  try {
    registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  } catch (e) {}
}

registry.agents.push({
  label,
  template: templateName,
  task,
  status: 'spawning',
  startedAt: new Date().toISOString(),
  config: spawnConfig
});

writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
console.log(`\n✅ Added to registry: ${REGISTRY_PATH}`);
console.log('\n💡 Use this config with sessions_spawn tool');
