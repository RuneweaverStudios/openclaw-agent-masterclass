#!/usr/bin/env node
/**
 * Recent - View recent memories
 * Usage: node recent.mjs [limit]
 */

import { Client } from 'pg';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres';

async function main() {
  const limit = parseInt(process.argv[2]) || 10;

  console.log(`📚 Recent ${limit} memories:\n`);

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const query = `
    SELECT
      id,
      content,
      metadata,
      created_at,
      importance
    FROM memories
    ORDER BY created_at DESC
    LIMIT $1
  `;

  const results = await client.query(query, [limit]);

  if (results.rows.length === 0) {
    console.log('No memories found.');
    console.log('\n💡 Tip: Add your first memory with:');
    console.log('   node capture.mjs "Your thought or learning here"');
    await client.end();
    return;
  }

  results.rows.forEach((row, i) => {
    const date = new Date(row.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    const preview = row.content.slice(0, 80);

    console.log(`${i + 1}. [${date}] [${row.importance}]`);
    console.log(`   ${preview}${preview.length < row.content.length ? '...' : ''}`);
    if (row.metadata?.topics?.length > 0) {
      console.log(`   Topics: ${row.metadata.topics.join(', ')}`);
    }
    console.log('');
  });

  console.log(`Total memories: ${results.rows.length}`);
  console.log('\n💡 Search memories: node search.mjs "your query"');

  await client.end();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
