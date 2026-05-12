-- CreateTable
CREATE TABLE "RoiImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "sourceTaskUuid" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "modelIsAnomaly" BOOLEAN NOT NULL,
    "userIsAnomaly" BOOLEAN NOT NULL,
    "roiType" TEXT NOT NULL DEFAULT 'NORMAL',
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "thumbnailPath" TEXT,
    "usedInRetrain" BOOLEAN NOT NULL DEFAULT false,
    "usedTaskUuid" TEXT,
    "usedAt" DATETIME,
    "generation" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RetrainTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "baseTaskUuid" TEXT NOT NULL,
    "newTaskUuid" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "fpCount" INTEGER NOT NULL DEFAULT 0,
    "fnCount" INTEGER NOT NULL DEFAULT 0,
    "encoderName" TEXT,
    "decoderDepth" INTEGER,
    "epochs" INTEGER,
    "batchSize" INTEGER,
    "freezeEncoder" BOOLEAN,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "RoiImage_productId_idx" ON "RoiImage"("productId");

-- CreateIndex
CREATE INDEX "RoiImage_sourceTaskUuid_idx" ON "RoiImage"("sourceTaskUuid");

-- CreateIndex
CREATE INDEX "RoiImage_roiType_idx" ON "RoiImage"("roiType");

-- CreateIndex
CREATE INDEX "RoiImage_usedInRetrain_idx" ON "RoiImage"("usedInRetrain");

-- CreateIndex
CREATE INDEX "RoiImage_usedTaskUuid_idx" ON "RoiImage"("usedTaskUuid");

-- CreateIndex
CREATE INDEX "RetrainTask_productId_idx" ON "RetrainTask"("productId");

-- CreateIndex
CREATE INDEX "RetrainTask_baseTaskUuid_idx" ON "RetrainTask"("baseTaskUuid");

-- CreateIndex
CREATE INDEX "RetrainTask_newTaskUuid_idx" ON "RetrainTask"("newTaskUuid");

-- CreateIndex
CREATE INDEX "RetrainTask_status_idx" ON "RetrainTask"("status");
