#!/usr/bin/env node
/**
 * Migrate - Move local JSON memories to Supabase
 * Usage: node migrate-to-supabase.mjs
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

async function main() {
  console.log('🔄 Migrating local memories to Supabase...\n');

  // Load local memories
  let localMemories;
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    localMemories = JSON.parse(data);
  } catch {
    console.log('No local memories found to migrate.');
    return;
  }

  if (localMemories.length === 0) {
    console.log('No local memories found to migrate.');
    return;
  }

  console.log(`Found ${localMemories.length} local memories.\n`);

  // Connect to Supabase
  const client = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase\n');

    let migrated = 0;
    let skipped = 0;

    for (const memory of localMemories) {
      try {
        // Check if already exists (by content hash)
        const checkQuery = 'SELECT id FROM memories WHERE content = $1 LIMIT 1';
        const existing = await client.query(checkQuery, [memory.content]);

        if (existing.rows.length > 0) {
          console.log(`⏭️  Skipping duplicate: ${memory.content.slice(0, 50)}...`);
          skipped++;
          continue;
        }

        // Get embedding
        const embedding = await getEmbedding(memory.content);
        const emb = embedding ? `[${embedding.join(',')}]` : null;

        // Insert into Supabase
        const insertQuery = `
          INSERT INTO memories (content, embedding, metadata, importance, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(insertQuery, [
          memory.content,
          emb,
          JSON.stringify(memory.metadata || {}),
          memory.importance || 'medium',
          memory.created_at || new Date().toISOString()
        ]);

        console.log(`✅ Migrated: ${memory.content.slice(0, 50)}...`);
        migrated++;

      } catch (error) {
        console.error(`❌ Failed: ${memory.content.slice(0, 50)}... - ${error.message}`);
      }
    }

    console.log(`\n📊 Migration complete!`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped (duplicates): ${skipped}`);
    console.log(`   Failed: ${localMemories.length - migrated - skipped}`);

    if (migrated > 0) {
      console.log(`\n✨ Your memories are now in Supabase with semantic search!`);
      console.log(`\n💡 Test it:`);
      console.log(`   node search.mjs "your query"`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Make sure Supabase is available and memories table exists.');
    console.log('   Run: node setup.mjs');
  } finally {
    await client.end();
  }
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
