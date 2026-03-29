const { Client } = require('pg');

const client = new Client({
  host: 'hopper.proxy.rlwy.net',
  port: 19966,
  user: 'postgres',
  password: 'QuoteSnap2026!',
  database: 'quote_snap',
  ssl: false,
});

async function run() {
  await client.connect();
  console.log('Connected');
  await client.query(`
    ALTER TABLE "ShopSettings"
      ADD COLUMN IF NOT EXISTS "buttonLabel"        TEXT NOT NULL DEFAULT 'Request a Quote',
      ADD COLUMN IF NOT EXISTS "buttonBgColor"      TEXT NOT NULL DEFAULT '#008060',
      ADD COLUMN IF NOT EXISTS "buttonTextColor"    TEXT NOT NULL DEFAULT '#ffffff',
      ADD COLUMN IF NOT EXISTS "buttonBorderRadius" TEXT NOT NULL DEFAULT '4',
      ADD COLUMN IF NOT EXISTS "formTitle"          TEXT NOT NULL DEFAULT 'Request a Quote',
      ADD COLUMN IF NOT EXISTS "formSuccessMsg"     TEXT NOT NULL DEFAULT 'Thank you! We''ll be in touch soon.',
      ADD COLUMN IF NOT EXISTS "formShowCompany"    BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "formSubmitLabel"    TEXT NOT NULL DEFAULT 'Submit Request'
  `);
  console.log('Migration applied: customization columns added');
  await client.end();
  console.log('Done');
}

run().catch(console.error);
