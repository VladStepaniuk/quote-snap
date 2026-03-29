const { Client } = require('pg');
const client = new Client({ host: 'crossover.proxy.rlwy.net', port: 39791, user: 'postgres', password: 'QuoteSnap2026!', database: 'quote_snap', ssl: false });
async function run() {
  await client.connect();
  await client.query(`ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "fontFamily" TEXT NOT NULL DEFAULT 'inherit', ADD COLUMN IF NOT EXISTS "fontSize" TEXT NOT NULL DEFAULT '16'`);
  console.log('Font columns added');
  await client.end();
}
run().catch(console.error);
