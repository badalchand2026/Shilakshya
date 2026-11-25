-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "shortDescription" VARCHAR(500) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" VARCHAR(500) NOT NULL,
    "imageAlt" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_sortOrder_idx" ON "services"("sortOrder");

-- CreateIndex
CREATE INDEX "services_isPublished_idx" ON "services"("isPublished");

-- CreateIndex
CREATE INDEX "services_category_idx" ON "services"("category");
