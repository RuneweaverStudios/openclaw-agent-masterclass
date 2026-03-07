#!/usr/bin/env node
/**
 * Search - Find memories (works with both Supabase and local JSON)
 * Usage: node search.mjs "your query"
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

// Get embedding for semantic search
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

// Search local JSON
async function searchLocal(query) {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const memories = JSON.parse(data);

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(w => w.length > 2);

    return memories
      .map(m => {
        const contentLower = m.content.toLowerCase();
        let score = 0;

        // Exact phrase match
        if (contentLower.includes(queryLower)) score += 50;

        // Word matches
        queryWords.forEach(word => {
          if (contentLower.includes(word)) score += 10;
        });

        // Topic matches
        if (m.metadata?.topics) {
          m.metadata.topics.forEach(topic => {
            if (queryLower.includes(topic)) score += 15;
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
  } catch {
    return [];
  }
}

// Search Supabase with semantic search
async function searchSupabase(query) {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  const embedding = await getEmbedding(query);

  let results;

  if (embedding) {
    // Semantic search
    const embStr = `[${embedding.join(',')}]`;
    const searchQuery = `
      SELECT
        id,
        content,
        metadata,
        created_at,
        importance,
        1 - (embedding <=> $1::vector) as similarity
      FROM memories
      ORDER BY embedding <=> $1::vector
      LIMIT 10
    `;
    results = await client.query(searchQuery, [embStr]);
  } else {
    // Text search fallback
    const searchQuery = `
      SELECT
        id,
        content,
        metadata,
        created_at,
        importance,
        0.5 as similarity
      FROM memories
      WHERE content ILIKE $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    results = await client.query(searchQuery, [`%${query}%`]);
  }

  await client.end();

  return results.rows.map(r => ({
    ...r,
    score: Math.round(r.similarity * 100)
  }));
}

async function main() {
  const query = process.argv.slice(2).join(' ');

  if (!query) {
    console.log('Usage: node search.mjs "your query"');
    console.log('Example: node search.mjs "pricing decisions"');
    process.exit(1);
  }

  console.log(`🔍 Searching for: "${query}"\n`);

  const useSupabase = await isSupabaseAvailable();

  let results;

  if (useSupabase) {
    console.log('Storage: Supabase (semantic search)\n');
    results = await searchSupabase(query);
  } else {
    console.log('Storage: Local JSON (text search)\n');
    results = await searchLocal(query);
  }

  if (results.length === 0) {
    console.log('No memories found.');
    console.log('\n💡 Capture your first memory:');
    console.log('   node capture.mjs "Your thought" --topics "topic1,topic2"');
    return;
  }

  console.log(`Found ${results.length} memories:\n`);

  results.forEach((row, i) => {
    const date = new Date(row.created_at).toLocaleDateString();
    const preview = row.content.slice(0, 100);

    console.log(`${i + 1}. [${row.score}${useSupabase ? '% match' : ' pts'}] [${date}] [${row.importance}]`);
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
