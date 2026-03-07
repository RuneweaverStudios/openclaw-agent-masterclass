#!/usr/bin/env node
/**
 * Create waitlist table in Supabase
 */

import pg from 'pg';

const DATABASE_URL = 'postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres';

async function main() {
  console.log('🔌 Connecting to Supabase...\n');

  const client = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    const createTableSQL = `
      -- Create waitlist table
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        source VARCHAR(50) DEFAULT 'website'
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);
      CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist (created_at DESC);

      -- Enable Row Level Security
      ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

      -- Allow anonymous inserts
      CREATE POLICY "Allow anonymous inserts" ON waitlist
        FOR INSERT
        TO anon
        WITH CHECK (true);

      -- Allow public to view
      CREATE POLICY "Allow public view" ON waitlist
        FOR SELECT
        TO anon
        USING (true);
    `;

    console.log('📊 Creating waitlist table...\n');
    await client.query(createTableSQL);
    console.log('✅ Waitlist table created!\n');

    // Verify table exists
    const check = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'waitlist'
      ORDER BY ordinal_position
    `);

    console.log('📋 Table structure:');
    check.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n✨ Ready to collect waitlist signups!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
