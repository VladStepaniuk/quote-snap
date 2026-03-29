ALTER TABLE "ShopSettings"
  ADD COLUMN IF NOT EXISTS "buttonLabel"        TEXT NOT NULL DEFAULT 'Request a Quote',
  ADD COLUMN IF NOT EXISTS "buttonBgColor"      TEXT NOT NULL DEFAULT '#008060',
  ADD COLUMN IF NOT EXISTS "buttonTextColor"    TEXT NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS "buttonBorderRadius" TEXT NOT NULL DEFAULT '4',
  ADD COLUMN IF NOT EXISTS "formTitle"          TEXT NOT NULL DEFAULT 'Request a Quote',
  ADD COLUMN IF NOT EXISTS "formSuccessMsg"     TEXT NOT NULL DEFAULT 'Thank you! We''ll be in touch soon.',
  ADD COLUMN IF NOT EXISTS "formShowCompany"    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "formSubmitLabel"    TEXT NOT NULL DEFAULT 'Submit Request';
