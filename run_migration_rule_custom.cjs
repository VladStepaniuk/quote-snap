const { Client } = require('pg');
const client = new Client({ host: 'crossover.proxy.rlwy.net', port: 10766, user: 'postgres', password: 'QuoteSnap2026!', database: 'quote_snap', ssl: false });
async function run() {
  await client.connect();
  await client.query(`
    ALTER TABLE "QuoteRule"
      ADD COLUMN IF NOT EXISTS "buttonBgColor"      TEXT,
      ADD COLUMN IF NOT EXISTS "buttonTextColor"    TEXT,
      ADD COLUMN IF NOT EXISTS "buttonBorderRadius" TEXT,
      ADD COLUMN IF NOT EXISTS "formTitle"          TEXT,
      ADD COLUMN IF NOT EXISTS "formSuccessMsg"     TEXT,
      ADD COLUMN IF NOT EXISTS "formShowCompany"    BOOLEAN,
      ADD COLUMN IF NOT EXISTS "formSubmitLabel"    TEXT,
      ADD COLUMN IF NOT EXISTS "fontFamily"         TEXT,
      ADD COLUMN IF NOT EXISTS "fontSize"           TEXT
  `);
  console.log('Rule customization columns added');
  await client.end();
}
run().catch(console.error);
