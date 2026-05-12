/*
  Warnings:

  - You are about to drop the `RetrainTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "RetrainTask_status_idx";

-- DropIndex
DROP INDEX "RetrainTask_newTaskUuid_idx";

-- DropIndex
DROP INDEX "RetrainTask_baseTaskUuid_idx";

-- DropIndex
DROP INDEX "RetrainTask_productId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RetrainTask";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrainingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "taskUuid" TEXT NOT NULL,
    "labelName" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" REAL NOT NULL DEFAULT 0,
    "totalEpochs" INTEGER,
    "currentEpoch" INTEGER,
    "batchSize" INTEGER,
    "learningRate" REAL,
    "latestIter" INTEGER,
    "metrics" TEXT NOT NULL DEFAULT '[]',
    "logs" TEXT NOT NULL DEFAULT '[]',
    "startTime" DATETIME,
    "endTime" DATETIME,
    "hasBestModel" BOOLEAN NOT NULL DEFAULT false,
    "outputPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isRetrain" BOOLEAN NOT NULL DEFAULT false,
    "baseTaskUuid" TEXT,
    "pathId" TEXT,
    "taskChain" TEXT NOT NULL DEFAULT '',
    "generation" INTEGER NOT NULL DEFAULT 0,
    "fpCount" INTEGER NOT NULL DEFAULT 0,
    "fnCount" INTEGER NOT NULL DEFAULT 0,
    "encoderName" TEXT,
    "decoderDepth" INTEGER,
    "epochs" INTEGER,
    "freezeEncoder" BOOLEAN
);
INSERT INTO "new_TrainingRecord" ("batchSize", "config", "createdAt", "currentEpoch", "endTime", "hasBestModel", "id", "labelName", "latestIter", "learningRate", "logs", "metrics", "modelName", "outputPath", "productId", "progress", "startTime", "status", "taskUuid", "totalEpochs", "updatedAt") SELECT "batchSize", "config", "createdAt", "currentEpoch", "endTime", "hasBestModel", "id", "labelName", "latestIter", "learningRate", "logs", "metrics", "modelName", "outputPath", "productId", "progress", "startTime", "status", "taskUuid", "totalEpochs", "updatedAt" FROM "TrainingRecord";
DROP TABLE "TrainingRecord";
ALTER TABLE "new_TrainingRecord" RENAME TO "TrainingRecord";
CREATE INDEX "TrainingRecord_productId_idx" ON "TrainingRecord"("productId");
CREATE INDEX "TrainingRecord_taskUuid_idx" ON "TrainingRecord"("taskUuid");
CREATE INDEX "TrainingRecord_status_idx" ON "TrainingRecord"("status");
CREATE INDEX "TrainingRecord_isRetrain_idx" ON "TrainingRecord"("isRetrain");
CREATE INDEX "TrainingRecord_baseTaskUuid_idx" ON "TrainingRecord"("baseTaskUuid");
CREATE UNIQUE INDEX "TrainingRecord_taskUuid_labelName_key" ON "TrainingRecord"("taskUuid", "labelName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
