const { Client } = require('pg');

const client = new Client({
  host: 'gondola.proxy.rlwy.net',
  port: 27863,
  user: 'postgres',
  password: 'QuoteSnap2026!',
  database: 'quote_snap',
  ssl: false,
});

async function run() {
  await client.connect();
  console.log('Connected');
  await client.query(`ALTER TABLE "QuoteRequest" ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT ''`);
  console.log('Migration applied: notes column added');
  
  // Also record migration in prisma migrations table
  await client.query(`
    INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
    VALUES (gen_random_uuid()::text, 'manual', NOW(), '20260328000000_add_quote_notes', NULL, NULL, NOW(), 1)
    ON CONFLICT DO NOTHING
  `).catch(() => console.log('Migration record skipped (table may not exist)'));
  
  await client.end();
  console.log('Done');
}

run().catch(console.error);
