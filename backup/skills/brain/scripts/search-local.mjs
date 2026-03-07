#!/usr/bin/env node
/**
 * Search - Find memories in local JSON
 * Usage: node search-local.mjs "your query"
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

function simpleSearch(memories, query) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(' ').filter(w => w.length > 2);

  return memories
    .map(m => {
      const contentLower = m.content.toLowerCase();
      let score = 0;

      // Exact phrase match
      if (contentLower.includes(queryLower)) {
        score += 50;
      }

      // Word matches
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          score += 10;
        }
      });

      // Topic matches
      if (m.metadata?.topics) {
        m.metadata.topics.forEach(topic => {
          if (queryLower.includes(topic)) {
            score += 15;
          }
        });
      }

      // Importance boost
      if (m.importance === 'high') score += 5;
      if (m.importance === 'medium') score += 2;

      return { ...m, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

async function main() {
  const query = process.argv.slice(2).join(' ');

  if (!query) {
    console.log('Usage: node search-local.mjs "your query"');
    console.log('Example: node search-local.mjs "pricing decisions"');
    process.exit(1);
  }

  console.log(`🔍 Searching for: "${query}"\n`);

  const memories = await loadMemories();

  if (memories.length === 0) {
    console.log('No memories found.');
    console.log('\n💡 Capture your first memory:');
    console.log('   node capture-local.mjs "Your thought"');
    return;
  }

  const results = simpleSearch(memories, query);

  if (results.length === 0) {
    console.log('No matching memories found.');
    console.log(`\n💡 Try broader search terms or capture related memories.`);
    return;
  }

  console.log(`Found ${results.length} memories:\n`);

  results.forEach((row, i) => {
    const date = new Date(row.created_at).toLocaleDateString();
    const preview = row.content.slice(0, 100);

    console.log(`${i + 1}. [${row.score} pts] [${date}] [${row.importance}]`);
    console.log(`   ${preview}${preview.length < row.content.length ? '...' : ''}`);
    if (row.metadata?.topics?.length > 0) {
      console.log(`   Topics: ${row.metadata.topics.join(', ')}`);
    }
    console.log('');
  });
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
