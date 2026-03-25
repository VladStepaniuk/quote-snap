-- CreateTable
CREATE TABLE "GdprRequest" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "customerId" TEXT NOT NULL DEFAULT '',
    "customerEmail" TEXT NOT NULL DEFAULT '',
    "payload" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GdprRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GdprRequest_shop_idx" ON "GdprRequest"("shop");
