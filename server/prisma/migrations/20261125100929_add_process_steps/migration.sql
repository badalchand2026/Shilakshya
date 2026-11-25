-- CreateTable
CREATE TABLE "process_steps" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "process_steps_position_idx" ON "process_steps"("position");

-- CreateIndex
CREATE INDEX "process_steps_isPublished_idx" ON "process_steps"("isPublished");
