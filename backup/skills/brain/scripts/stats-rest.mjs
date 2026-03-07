#!/usr/bin/env node
/**
 * Stats - Show brain statistics
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZGhkY21zd3l4b3JienJ4c2VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY4NDU3OCwiZXhwIjoyMDg4MjYwNTc4fQ.UMKyvPFh9BStf1pQO-xLw5p7gY0u7mygcufRyKFFwe4';

async function main() {
  console.log('🧠 Brain Statistics\n');
  console.log('---\n');

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
    console.log(`📊 Total Memories: ${total}\n`);
  }

  // Get oldest and newest
  const rangeResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/memories?select=created_at&order=created_at.asc&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (rangeResponse.ok) {
    const oldest = await rangeResponse.json();
    if (oldest.length > 0) {
      const oldestDate = new Date(oldest[0].created_at).toLocaleDateString();
      console.log(`📅 Oldest Memory: ${oldestDate}\n`);
    }
  }

  const newestResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/memories?select=created_at&order=created_at.desc&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (newestResponse.ok) {
    const newest = await newestResponse.json();
    if (newest.length > 0) {
      const newestDate = new Date(newest[0].created_at).toLocaleDateString();
      console.log(`📅 Newest Memory: ${newestDate}\n`);
    }
  }

  // Check embeddings
  const embeddingResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/memories?select=id&embedding=not.is.null`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    }
  );

  if (embeddingResponse.ok) {
    const withEmbeddings = await embeddingResponse.json();
    console.log(`🔗 With Embeddings: ${withEmbeddings.length}\n`);
  }

  console.log('---\n');
  console.log('✅ Status: Operational\n');
  console.log('Backend: Supabase REST API\n');
  console.log('Search: Text-based (semantic with OPENAI_API_KEY)\n');
  console.log('---\n');
  console.log('Commands:\n');
  console.log('  Capture: node scripts/capture-rest.mjs "Your thought" --topics "topic1"');
  console.log('  Search:  node scripts/search-rest.mjs "query"');
  console.log('  Recent:  node scripts/recent-rest.mjs [limit]');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
