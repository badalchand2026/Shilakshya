-- CreateTable
CREATE TABLE "statistics" (
    "id" UUID NOT NULL,
    "value" VARCHAR(50) NOT NULL,
    "label" VARCHAR(150) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "statistics_sortOrder_idx" ON "statistics"("sortOrder");

-- CreateIndex
CREATE INDEX "statistics_isPublished_idx" ON "statistics"("isPublished");
