#!/usr/bin/env node
/**
 * Search - Semantic search in memories via Supabase RPC
 * Usage: node search-rest.mjs "your query" [--limit 10]
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZGhkY21zd3l4b3JienJ4c2VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY4NDU3OCwiZXhwIjoyMDg4MjYwNTc4fQ.UMKyvPFh9BStf1pQO-xLw5p7gY0u7mygcufRyKFFwe4';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Parse arguments
const args = process.argv.slice(2);
let query = '';
let limit = 10;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit' && args[i + 1]) {
    limit = parseInt(args[i + 1]);
    i++;
  } else if (!args[i].startsWith('--')) {
    query += (query ? ' ' : '') + args[i];
  }
}

if (!query) {
  console.error('Usage: node search-rest.mjs "your query" [--limit 10]');
  process.exit(1);
}

async function getEmbedding(text) {
  if (!OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log(`🔍 Searching for: "${query}"\n`);

  const embedding = await getEmbedding(query);

  if (embedding) {
    // Semantic search via RPC function
    console.log('📊 Using semantic search (embeddings)\n');
    
    // We need to create an RPC function first
    // For now, fall back to text search
    console.log('⚠️  Semantic search requires RPC function setup.');
    console.log('Falling back to text search...\n');
  }

  // Text search (using full-text search or simple ILIKE)
  // For now, search in content field using ILIKE with wildcards
  const searchQuery = query.split(' ').map(term => `content.ilike.%${term}%`).join(',');
  
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/memories?select=*&or=(${encodeURIComponent(searchQuery)})&order=created_at.desc&limit=${limit}`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Supabase error: ${error.message || response.status}`);
  }

  const results = await response.json();

  if (results.length === 0) {
    console.log('No memories found.\n');
    console.log('Capture a memory first:');
    console.log('  node capture-rest.mjs "Your thought"');
    return;
  }

  console.log(`Found ${results.length} memories:\n`);
  console.log('---\n');

  results.forEach((memory, i) => {
    const date = new Date(memory.created_at).toLocaleDateString();
    console.log(`${i + 1}. [${date}]`);
    console.log(`   ${memory.content}`);
    if (memory.metadata && memory.metadata.topics) {
      console.log(`   Topics: ${memory.metadata.topics.join(', ')}`);
    }
    console.log('');
  });

  console.log('---\n');
  console.log(`Showing ${results.length} result(s)`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
