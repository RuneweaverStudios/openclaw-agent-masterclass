#!/usr/bin/env node
/**
 * Recent - View recent memories from local JSON
 * Usage: node recent-local.mjs [limit]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/memories.json');

async function loadMemories() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function main() {
  const limit = parseInt(process.argv[2]) || 10;

  console.log(`📚 Recent ${limit} memories:\n`);

  const memories = await loadMemories();

  if (memories.length === 0) {
    console.log('No memories found.');
    console.log('\n💡 Capture your first memory:');
    console.log('   node capture-local.mjs "Your thought" --topics "topic1,topic2"');
    return;
  }

  const recent = memories
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);

  recent.forEach((row, i) => {
    const date = new Date(row.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    const preview = row.content.slice(0, 80);

    console.log(`${i + 1}. [${date}] [${row.importance}]`);
    console.log(`   ${preview}${preview.length < row.content.length ? '...' : ''}`);
    if (row.metadata?.topics?.length > 0) {
      console.log(`   Topics: ${row.metadata.topics.join(', ')}`);
    }
    console.log('');
  });

  console.log(`Total memories: ${memories.length}`);
  console.log('\n💡 Search memories: node search-local.mjs "your query"');
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
