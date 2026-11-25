-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "position" VARCHAR(150) NOT NULL,
    "bio" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "education" TEXT,
    "imageUrl" VARCHAR(500) NOT NULL,
    "imageAlt" VARCHAR(255),
    "socialLinks" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_members_sortOrder_idx" ON "team_members"("sortOrder");

-- CreateIndex
CREATE INDEX "team_members_isPublished_idx" ON "team_members"("isPublished");
