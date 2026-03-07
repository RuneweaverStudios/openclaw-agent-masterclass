-- Waitlist Table for Polysauce
-- Run this in Supabase SQL Editor

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'website',
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist (created_at DESC);

-- Enable Row Level Security (optional, for public access)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for public waitlist signup)
CREATE POLICY "Allow anonymous inserts" ON waitlist
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow public to view count only (optional)
CREATE POLICY "Allow public count" ON waitlist
    FOR SELECT
    TO anon
    USING (true);

-- View waitlist count
SELECT COUNT(*) as total_signups FROM waitlist;

-- View recent signups
SELECT
    email,
    created_at,
    source
FROM waitlist
ORDER BY created_at DESC
LIMIT 10;

-- Export waitlist (run this to get CSV)
COPY (
    SELECT
        email,
        created_at,
        source
    FROM waitlist
    ORDER BY created_at DESC
) TO STDOUT WITH CSV HEADER;
