ALTER TABLE "QuoteRule"
  ADD COLUMN IF NOT EXISTS "buttonBgColor"      TEXT,
  ADD COLUMN IF NOT EXISTS "buttonTextColor"    TEXT,
  ADD COLUMN IF NOT EXISTS "buttonBorderRadius" TEXT,
  ADD COLUMN IF NOT EXISTS "formTitle"          TEXT,
  ADD COLUMN IF NOT EXISTS "formSuccessMsg"     TEXT,
  ADD COLUMN IF NOT EXISTS "formShowCompany"    BOOLEAN,
  ADD COLUMN IF NOT EXISTS "formSubmitLabel"    TEXT,
  ADD COLUMN IF NOT EXISTS "fontFamily"         TEXT,
  ADD COLUMN IF NOT EXISTS "fontSize"           TEXT;
