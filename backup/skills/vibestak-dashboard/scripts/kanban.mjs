#!/usr/bin/env node
/**
 * Kanban operations
 * Usage: node kanban.mjs add "Task" --status todo
 *        node kanban.mjs move "Task" --to inProgress
 *        node kanban.mjs done "Task"
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = '~/.openclaw/workspace/skills/vibestak-dashboard/data';

const args = process.argv.slice(2);
let action = args[0];
let task = args[1];
let status = 'todo';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--status') status = args[++i];
  if (args[i] === '--to') status = args[++i];
}

const kanbanPath = join(DATA_DIR, 'kanban.json');
let kanban = { todo: [], inProgress: [], done: [], blocked: [], accelerating: [] };

try {
  kanban = JSON.parse(readFileSync(kanbanPath, 'utf-8'));
} catch {}

// Execute action
if (action === 'add' && task) {
  kanban[status].push(task);
  console.log(`✅ Added "${task}" to ${status}`);
}
else if (action === 'move' && task) {
  // Remove from all lists, add to new
  for (const key in kanban) {
    kanban[key] = kanban[key].filter(t => t !== task);
  }
  kanban[status].push(task);
  console.log(`✅ Moved "${task}" to ${status}`);
}
else if (action === 'done' && task) {
  for (const key in kanban) {
    kanban[key] = kanban[key].filter(t => t !== task);
  }
  kanban.done.push(task);
  console.log(`✅ Marked "${task}" as done`);
}
else if (action === 'block' && task) {
  for (const key in kanban) {
    kanban[key] = kanban[key].filter(t => t !== task);
  }
  kanban.blocked.push(task);
  console.log(`✅ Blocked "${task}"`);
}
else if (action === 'accelerate' && task) {
  for (const key in kanban) {
    kanban[key] = kanban[key].filter(t => t !== task);
  }
  kanban.accelerating.push(task);
  console.log(`✅ Accelerated "${task}"`);
}

writeFileSync(kanbanPath, JSON.stringify(kanban, null, 2));
