-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "role" VARCHAR(150) NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "imageAlt" VARCHAR(255),
    "logoImageUrl" VARCHAR(500) NOT NULL,
    "logoImageAlt" VARCHAR(255),
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "testimonials_sortOrder_idx" ON "testimonials"("sortOrder");

-- CreateIndex
CREATE INDEX "testimonials_isPublished_idx" ON "testimonials"("isPublished");

-- CreateIndex
CREATE INDEX "testimonials_rating_idx" ON "testimonials"("rating");
