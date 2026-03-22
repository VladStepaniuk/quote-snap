-- CreateTable
CREATE TABLE "QuoteRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "scopeValue" TEXT NOT NULL DEFAULT '',
    "visibility" TEXT NOT NULL,
    "customerTag" TEXT NOT NULL DEFAULT '',
    "hidePrice" BOOLEAN NOT NULL DEFAULT true,
    "replaceAddToCart" BOOLEAN NOT NULL DEFAULT true,
    "quoteButtonLabel" TEXT NOT NULL DEFAULT 'Request a Quote',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "QuoteRule_shop_idx" ON "QuoteRule"("shop");

-- CreateIndex
CREATE INDEX "QuoteRequest_shop_idx" ON "QuoteRequest"("shop");
