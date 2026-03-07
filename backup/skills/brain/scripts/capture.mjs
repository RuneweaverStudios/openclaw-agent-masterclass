#!/usr/bin/env node
/**
 * Brain - Smart wrapper that uses Supabase if available, local JSON otherwise
 * Usage: node capture.mjs "Your thought"
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/memories.json');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres';

// Check if Supabase is available
async function isSupabaseAvailable() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}

// Local JSON methods
async function loadMemories() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveMemories(memories) {
  const dataDir = path.dirname(DATA_FILE);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(memories, null, 2), 'utf-8');
}

// Get embedding (optional)
async function getEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch {
    return null;
  }
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

// Store to Supabase
async function storeToSupabase(text, embedding, metadata, importance) {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  const query = `
    INSERT INTO memories (content, embedding, metadata, importance)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  const emb = embedding ? `[${embedding.join(',')}]` : null;
  const result = await client.query(query, [text, emb, JSON.stringify(metadata), importance]);
  await client.end();

  return result.rows[0].id;
}

// Store to local JSON
async function storeToLocal(text, metadata, importance) {
  const memories = await loadMemories();
  const memory = {
    id: memories.length + 1,
    content: text,
    metadata,
    created_at: new Date().toISOString(),
    importance
  };

  memories.push(memory);
  await saveMemories(memories);
  return memory.id;
}

async function main() {
  const { text, options } = parseArgs();

  if (!text) {
    console.log('Usage: node capture.mjs "Your thought"');
    console.log('  node capture.mjs "Decision: Use Polysauce" --topics polysauce --importance high');
    process.exit(1);
  }

  console.log('🧠 Capturing to brain:', text.slice(0, 50) + '...');

  const metadata = extractMetadata(text, options.topics);

  // Check if Supabase is available
  const useSupabase = await isSupabaseAvailable();

  if (useSupabase) {
    // Use Supabase with embeddings
    console.log('   Storage: Supabase (vector database)');
    const embedding = await getEmbedding(text);
    if (embedding) console.log('   ✅ Generated embedding');

    const id = await storeToSupabase(text, embedding, metadata, options.importance);
    console.log('✅ Stored in brain!');
    console.log(`   ID: ${id}`);
  } else {
    // Use local JSON
    console.log('   Storage: Local JSON (Supabase unavailable)');
    const id = await storeToLocal(text, metadata, options.importance);
    console.log('✅ Stored in brain!');
    console.log(`   ID: ${id}`);
  }

  console.log(`   Topics: ${metadata.topics.join(', ') || 'none'}`);
  console.log(`   Importance: ${options.importance}`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
