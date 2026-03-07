#!/usr/bin/env node
/**
 * Setup - Initialize Brain database with pgvector (via Supabase REST API)
 * Usage: node setup-rest.mjs
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZGhkY21zd3l4b3JienJ4c2VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY4NDU3OCwiZXhwIjoyMDg4MjYwNTc4fQ.UMKyvPFh9BStf1pQO-xLw5p7gY0u7mygcufRyKFFwe4';

async function main() {
  console.log('🧠 Setting up Brain database via REST API...\n');
  console.log('Project URL:', SUPABASE_URL);
  console.log('');

  try {
    // First, check if memories table exists
    console.log('📋 Checking if memories table exists...\n');
    
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=count`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    if (checkResponse.ok) {
      console.log('✅ Memories table already exists!\n');
      
      // Show current structure
      const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      });
      
      const schema = await schemaResponse.json();
      
      if (schema.definitions && schema.definitions.memories) {
        console.log('📊 Current table structure:');
        console.log(JSON.stringify(schema.definitions.memories.properties, null, 2));
      }
      
      return;
    }

    // Table doesn't exist - need to create via SQL
    console.log('⚠️  Memories table not found.');
    console.log('\n📝 You need to create it manually in Supabase SQL Editor:\n');
    console.log('---');
    console.log(`
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table
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

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can do anything" ON memories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
    `);
    console.log('---\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/YOUR_SUPABASE_PROJECT_ID/sql');
    console.log('2. Paste the SQL above');
    console.log('3. Click "Run"');
    console.log('4. Run this script again to verify');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
