const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function run() {
  await client.connect();

  // Apply ShopSettings migration
  await client.query(`
    CREATE TABLE IF NOT EXISTS "ShopSettings" (
      "id" TEXT NOT NULL,
      "shop" TEXT NOT NULL,
      "notificationEmail" TEXT NOT NULL DEFAULT '',
      "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
    );
  `);

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "ShopSettings_shop_key" ON "ShopSettings"("shop");
  `);

  // Mark migration as applied
  await client.query(`
    INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
    VALUES (
      gen_random_uuid()::text,
      'manual',
      NOW(),
      '20260325200000_add_shop_settings',
      NULL,
      NULL,
      NOW(),
      1
    )
    ON CONFLICT DO NOTHING;
  `);

  console.log("Migration applied successfully");
  await client.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
