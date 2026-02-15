/*
  Warnings:
  - This migration will delete all existing TrainingRecord data and recreate the table with new schema
*/

-- Drop all existing data
DELETE FROM "TrainingRecord";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
DROP TABLE "TrainingRecord";
CREATE TABLE "TrainingRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "taskUuid" TEXT NOT NULL,
    "labelName" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" REAL NOT NULL DEFAULT 0,
    "totalEpochs" INTEGER,
    "currentEpoch" INTEGER,
    "latestIter" INTEGER,
    "metrics" TEXT NOT NULL DEFAULT '[]',
    "logs" TEXT NOT NULL DEFAULT '[]',
    "startTime" DATETIME,
    "endTime" DATETIME,
    "hasBestModel" BOOLEAN NOT NULL DEFAULT false,
    "outputPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE INDEX "TrainingRecord_productId_idx" ON "TrainingRecord"("productId");
CREATE INDEX "TrainingRecord_taskUuid_idx" ON "TrainingRecord"("taskUuid");
CREATE INDEX "TrainingRecord_status_idx" ON "TrainingRecord"("status");
CREATE UNIQUE INDEX "TrainingRecord_taskUuid_labelName_key" ON "TrainingRecord"("taskUuid", "labelName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
