#!/usr/bin/env node
/**
 * Recent - View recent memories
 * Usage: node recent-rest.mjs [limit]
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZGhkY21zd3l4b3JienJ4c2VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY4NDU3OCwiZXhwIjoyMDg4MjYwNTc4fQ.UMKyvPFh9BStf1pQO-xLw5p7gY0u7mygcufRyKFFwe4';

const limit = parseInt(process.argv[2]) || 10;

async function main() {
  console.log(`📚 Recent memories (last ${limit})\n`);

  // Get total count
  const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/memories?select=count`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'count=exact'
    }
  });

  if (countResponse.ok) {
    const contentRange = countResponse.headers.get('content-range');
    const total = contentRange ? contentRange.split('/')[1] : '?';
    console.log(`Total memories: ${total}\n`);
  }

  // Get recent memories
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/memories?select=*&order=created_at.desc&limit=${limit}`,
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

  const memories = await response.json();

  if (memories.length === 0) {
    console.log('No memories yet.\n');
    console.log('Capture your first memory:');
    console.log('  node capture-rest.mjs "Your thought" --topics "topic1,topic2"');
    return;
  }

  console.log('---\n');

  memories.forEach((memory, i) => {
    const date = new Date(memory.created_at).toLocaleString();
    console.log(`${i + 1}. [${date}]`);
    console.log(`   ${memory.content}`);
    if (memory.metadata && memory.metadata.topics && memory.metadata.topics.length > 0) {
      console.log(`   Topics: ${memory.metadata.topics.join(', ')}`);
    }
    console.log('');
  });

  console.log('---\n');
  console.log(`Showing ${memories.length} memory(ies)\n`);
  console.log('Search memories:');
  console.log('  node search-rest.mjs "your query"');
  console.log('\nCapture new memory:');
  console.log('  node capture-rest.mjs "Your thought" --topics "topic1,topic2"');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
