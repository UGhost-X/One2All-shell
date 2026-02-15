-- CreateTable
CREATE TABLE "TrainingRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "taskUuid" TEXT NOT NULL,
    "datasetVersionId" INTEGER,
    "modelName" TEXT NOT NULL,
    "labelNames" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" REAL NOT NULL DEFAULT 0,
    "totalEpochs" INTEGER,
    "currentEpoch" INTEGER,
    "latestIter" INTEGER,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "hasBestModel" BOOLEAN NOT NULL DEFAULT false,
    "outputPath" TEXT,
    "logPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRecord_taskUuid_key" ON "TrainingRecord"("taskUuid");

-- CreateIndex
CREATE INDEX "TrainingRecord_productId_idx" ON "TrainingRecord"("productId");

-- CreateIndex
CREATE INDEX "TrainingRecord_taskUuid_idx" ON "TrainingRecord"("taskUuid");

-- CreateIndex
CREATE INDEX "TrainingRecord_status_idx" ON "TrainingRecord"("status");
