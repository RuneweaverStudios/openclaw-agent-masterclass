#!/usr/bin/env node
/**
 * Brain - Local JSON Storage (Fallback when Supabase unavailable)
 * Usage: node capture-local.mjs "Your thought"
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/memories.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  await fs.mkdir(dataDir, { recursive: true });
}

// Load memories from JSON
async function loadMemories() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save memories to JSON
async function saveMemories(memories) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(memories, null, 2), 'utf-8');
}

// Extract metadata
function extractMetadata(text, topics) {
  const meta = { topics: topics || [], people: [], actionItems: [] };

  if (meta.topics.length === 0) {
    const keywords = [
      'pricing', 'product', 'marketing', 'sales', 'code', 'ai', 'agents',
      'stripe', 'supabase', 'openclaw', 'polysauce', 'growth', 'twitter',
      'tiktok', 'youtube', 'content', 'decision', 'goal', 'deadline'
    ];

    keywords.forEach(t => {
      if (text.toLowerCase().includes(t) && !meta.topics.includes(t)) {
        meta.topics.push(t);
      }
    });
  }

  if (text.toLowerCase().includes('todo') ||
      text.toLowerCase().includes('task') ||
      text.toLowerCase().includes('next')) {
    meta.actionItems.push('needs review');
  }

  return meta;
}

// Parse args
function parseArgs() {
  const args = process.argv.slice(2);
  const text = [];
  const options = { topics: [], importance: 'medium' };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topics' && args[i + 1]) {
      options.topics = args[i + 1].split(',').map(t => t.trim());
      i++;
    } else if (args[i] === '--importance' && args[i + 1]) {
      options.importance = args[i + 1];
      i++;
    } else {
      text.push(args[i]);
    }
  }

  return { text: text.join(' '), options };
}

async function main() {
  const { text, options } = parseArgs();

  if (!text) {
    console.log('Usage: node capture-local.mjs "Your thought"');
    console.log('  node capture-local.mjs "Decision: Use Polysauce" --topics polysauce --importance high');
    process.exit(1);
  }

  console.log('🧠 Capturing to brain (local):', text.slice(0, 50) + '...');

  const memories = await loadMemories();
  const metadata = extractMetadata(text, options.topics);

  const memory = {
    id: memories.length + 1,
    content: text,
    metadata,
    created_at: new Date().toISOString(),
    importance: options.importance
  };

  memories.push(memory);
  await saveMemories(memories);

  console.log('✅ Stored in brain!');
  console.log(`   ID: ${memory.id}`);
  console.log(`   Topics: ${metadata.topics.join(', ') || 'none'}`);
  console.log(`   Importance: ${options.importance}`);
  console.log(`   Storage: Local JSON (${memories.length} total memories)`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
