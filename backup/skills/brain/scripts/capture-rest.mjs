#!/usr/bin/env node
/**
 * Capture - Store a memory in Supabase with optional embedding
 * Usage: node capture-rest.mjs "Your thought" [--topics "topic1,topic2"] [--importance high]
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZGhkY21zd3l4b3JienJ4c2VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY4NDU3OCwiZXhwIjoyMDg4MjYwNTc4fQ.UMKyvPFh9BStf1pQO-xLw5p7gY0u7mygcufRyKFFwe4';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Parse arguments
const args = process.argv.slice(2);
let content = '';
let topics = [];
let importance = 'medium';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--topics' && args[i + 1]) {
    topics = args[i + 1].split(',').map(t => t.trim());
    i++;
  } else if (args[i] === '--importance' && args[i + 1]) {
    importance = args[i + 1];
    i++;
  } else if (!args[i].startsWith('--')) {
    content += (content ? ' ' : '') + args[i];
  }
}

if (!content) {
  console.error('Usage: node capture-rest.mjs "Your thought" [--topics "topic1,topic2"] [--importance low|medium|high]');
  process.exit(1);
}

async function getEmbedding(text) {
  if (!OPENAI_API_KEY) {
    console.log('⚠️  No OPENAI_API_KEY - skipping embedding (text search only)');
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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('⚠️  Embedding failed:', error.message);
    return null;
  }
}

async function main() {
  console.log('🧠 Capturing memory...\n');
  console.log('Content:', content);
  console.log('Topics:', topics);
  console.log('Importance:', importance);
  console.log('');

  // Get embedding
  const embedding = await getEmbedding(content);

  // Prepare metadata
  const metadata = {
    topics: topics,
    captured_at: new Date().toISOString()
  };

  // Insert into Supabase
  const insertData = {
    content: content,
    metadata: metadata,
    created_at: new Date().toISOString()
  };

  if (embedding) {
    insertData.embedding = JSON.stringify(embedding);
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/memories`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(insertData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Supabase error: ${error.message || response.status}`);
  }

  console.log('✅ Memory captured!\n');
  console.log('View all memories:');
  console.log('  node recent-rest.mjs');
  console.log('');
  console.log('Search memories:');
  console.log('  node search-rest.mjs "your query"');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
