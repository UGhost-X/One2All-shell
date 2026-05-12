-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RetrainTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "baseTaskUuid" TEXT NOT NULL,
    "newTaskUuid" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "taskChain" TEXT NOT NULL DEFAULT '',
    "generation" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_RetrainTask" ("baseTaskUuid", "batchSize", "createdAt", "decoderDepth", "encoderName", "epochs", "fnCount", "fpCount", "freezeEncoder", "id", "message", "newTaskUuid", "pathId", "productId", "status", "updatedAt") SELECT "baseTaskUuid", "batchSize", "createdAt", "decoderDepth", "encoderName", "epochs", "fnCount", "fpCount", "freezeEncoder", "id", "message", "newTaskUuid", "pathId", "productId", "status", "updatedAt" FROM "RetrainTask";
DROP TABLE "RetrainTask";
ALTER TABLE "new_RetrainTask" RENAME TO "RetrainTask";
CREATE INDEX "RetrainTask_productId_idx" ON "RetrainTask"("productId");
CREATE INDEX "RetrainTask_baseTaskUuid_idx" ON "RetrainTask"("baseTaskUuid");
CREATE INDEX "RetrainTask_newTaskUuid_idx" ON "RetrainTask"("newTaskUuid");
CREATE INDEX "RetrainTask_status_idx" ON "RetrainTask"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
