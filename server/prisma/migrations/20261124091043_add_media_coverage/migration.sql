-- CreateTable
CREATE TABLE "media_coverage" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "headline" VARCHAR(500) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "imageAlt" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_coverage_sortOrder_idx" ON "media_coverage"("sortOrder");

-- CreateIndex
CREATE INDEX "media_coverage_isPublished_idx" ON "media_coverage"("isPublished");

-- CreateIndex
CREATE INDEX "media_coverage_createdAt_idx" ON "media_coverage"("createdAt");
