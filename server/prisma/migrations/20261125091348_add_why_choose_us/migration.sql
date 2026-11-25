-- CreateTable
CREATE TABLE "why_choose_us" (
    "id" UUID NOT NULL,
    "icon" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "color" VARCHAR(50) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "why_choose_us_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "why_choose_us_sortOrder_idx" ON "why_choose_us"("sortOrder");

-- CreateIndex
CREATE INDEX "why_choose_us_isPublished_idx" ON "why_choose_us"("isPublished");
