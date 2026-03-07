#!/usr/bin/env node
/**
 * Test Connection - Verify Supabase connection string works
 * Usage: node test-connection.mjs "your-connection-string"
 */

import pg from 'pg';

async function main() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL;

  if (!connectionString) {
    console.log('Usage: node test-connection.mjs "postgresql://..."');
    console.log('   or: DATABASE_URL="..." node test-connection.mjs');
    process.exit(1);
  }

  // Hide password in output
  const displayUrl = connectionString.replace(/:[^:@]+@/, ':****@');
  console.log('Testing connection to:', displayUrl);
  console.log('');

  const client = new pg.Client({ connectionString });

  try {
    console.log('Connecting...');
    await client.connect();

    console.log('✅ Connected successfully!\n');

    // Test query
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);

    // Check if pgvector is available
    const extCheck = await client.query(`
      SELECT * FROM pg_available_extensions WHERE name = 'vector'
    `);

    if (extCheck.rows.length > 0) {
      console.log('✅ pgvector extension available');

      // Check if installed
      const installed = await client.query(`
        SELECT * FROM pg_extension WHERE extname = 'vector'
      `);

      if (installed.rows.length > 0) {
        console.log('✅ pgvector extension installed');
      } else {
        console.log('⚠️  pgvector not installed yet (will be installed by setup.mjs)');
      }
    } else {
      console.log('❌ pgvector extension NOT available');
      console.log('   Your Supabase plan may not support pgvector');
    }

    console.log('\n✨ Connection is working! Ready to run setup.mjs');

  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nCommon issues:');
    console.error('  - Wrong hostname');
    console.error('  - Wrong password');
    console.error('  - Project paused (free tier)');
    console.error('  - Network/firewall issue');
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
