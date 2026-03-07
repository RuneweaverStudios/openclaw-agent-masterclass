#!/usr/bin/env node
/**
 * Setup - Initialize Brain database with pgvector
 * Usage: node setup.mjs
 */

import pg from 'pg';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres';

async function main() {
  console.log('🧠 Setting up Brain database...\n');
  console.log('Connecting to:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  console.log('');

  const client = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase!\n');

    const setupSQL = `
      -- Enable pgvector extension
      CREATE EXTENSION IF NOT EXISTS vector;

      -- Drop existing table if needed
      DROP TABLE IF EXISTS memories;

      -- Create table
      CREATE TABLE memories (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        embedding vector(1536),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        importance VARCHAR(20) CHECK (importance IN ('low', 'medium', 'high'))
      );

      -- Create similarity search index
      CREATE INDEX memories_embedding_idx ON memories
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);

      -- Create metadata index
      CREATE INDEX memories_metadata_idx ON memories USING GIN (metadata);

      -- Create timestamp index
      CREATE INDEX memories_created_at_idx ON memories (created_at DESC);
    `;

    console.log('Running database setup...\n');
    await client.query(setupSQL);

    console.log('✅ Database setup complete!\n');
    console.log('📊 Table structure:');
    console.log('   - memories table created');
    console.log('   - Vector extension enabled');
    console.log('   - Indexes created');

    // Verify table exists
    const verify = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'memories'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Columns:');
    verify.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n✨ Ready to capture memories!');
    console.log('\nUsage:');
    console.log('  node capture.mjs "Your thought" --topics "topic1,topic2"');
    console.log('  node search.mjs "your query"');
    console.log('  node recent.mjs [limit]');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
