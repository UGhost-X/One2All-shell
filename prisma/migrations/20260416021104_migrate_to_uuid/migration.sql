/*
  Warnings:

  - The primary key for the `Annotation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AnnotationScheme` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Camera` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DatasetVersion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TrainingRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Annotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Annotation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Annotation" ("createdAt", "data", "id", "imagePath", "productId", "updatedAt") SELECT "createdAt", "data", "id", "imagePath", "productId", "updatedAt" FROM "Annotation";
DROP TABLE "Annotation";
ALTER TABLE "new_Annotation" RENAME TO "Annotation";
CREATE INDEX "Annotation_productId_idx" ON "Annotation"("productId");
CREATE INDEX "Annotation_imagePath_idx" ON "Annotation"("imagePath");
CREATE TABLE "new_AnnotationScheme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AnnotationScheme" ("config", "createdAt", "id", "name", "updatedAt") SELECT "config", "createdAt", "id", "name", "updatedAt" FROM "AnnotationScheme";
DROP TABLE "AnnotationScheme";
ALTER TABLE "new_AnnotationScheme" RENAME TO "AnnotationScheme";
CREATE UNIQUE INDEX "AnnotationScheme_name_key" ON "AnnotationScheme"("name");
CREATE TABLE "new_AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "dataPath" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'zh',
    "backendMode" TEXT NOT NULL DEFAULT 'local',
    "backendIp" TEXT NOT NULL DEFAULT 'localhost',
    "backendUrl" TEXT NOT NULL DEFAULT 'http://localhost:8000',
    "backendPort" TEXT NOT NULL DEFAULT '8000',
    "imageSettings" TEXT DEFAULT '{"exposure":6084,"gain":1.2}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AppSettings" ("backendIp", "backendMode", "backendPort", "backendUrl", "createdAt", "dataPath", "id", "imageSettings", "locale", "updatedAt") SELECT "backendIp", "backendMode", "backendPort", "backendUrl", "createdAt", "dataPath", "id", "imageSettings", "locale", "updatedAt" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
CREATE TABLE "new_Camera" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "config" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isNetworkCamera" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Camera" ("config", "createdAt", "id", "ip", "isEnabled", "isNetworkCamera", "name", "status", "updatedAt") SELECT "config", "createdAt", "id", "ip", "isEnabled", "isNetworkCamera", "name", "status", "updatedAt" FROM "Camera";
DROP TABLE "Camera";
ALTER TABLE "new_Camera" RENAME TO "Camera";
CREATE TABLE "new_DatasetVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "versionName" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL DEFAULT 'data_augmentation',
    "savePath" TEXT NOT NULL,
    "imageCount" INTEGER NOT NULL,
    "config" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DatasetVersion" ("config", "createdAt", "displayName", "id", "imageCount", "moduleName", "productId", "savePath", "versionName") SELECT "config", "createdAt", "displayName", "id", "imageCount", "moduleName", "productId", "savePath", "versionName" FROM "DatasetVersion";
DROP TABLE "DatasetVersion";
ALTER TABLE "new_DatasetVersion" RENAME TO "DatasetVersion";
CREATE INDEX "DatasetVersion_productId_idx" ON "DatasetVersion"("productId");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "lastImagePath" TEXT,
    "schemeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "AnnotationScheme" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("createdAt", "id", "lastImagePath", "model", "name", "schemeId", "updatedAt") SELECT "createdAt", "id", "lastImagePath", "model", "name", "schemeId", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TrainingRecord" ("batchSize", "config", "createdAt", "currentEpoch", "endTime", "hasBestModel", "id", "labelName", "latestIter", "learningRate", "logs", "metrics", "modelName", "outputPath", "productId", "progress", "startTime", "status", "taskUuid", "totalEpochs", "updatedAt") SELECT "batchSize", "config", "createdAt", "currentEpoch", "endTime", "hasBestModel", "id", "labelName", "latestIter", "learningRate", "logs", "metrics", "modelName", "outputPath", "productId", "progress", "startTime", "status", "taskUuid", "totalEpochs", "updatedAt" FROM "TrainingRecord";
DROP TABLE "TrainingRecord";
ALTER TABLE "new_TrainingRecord" RENAME TO "TrainingRecord";
CREATE INDEX "TrainingRecord_productId_idx" ON "TrainingRecord"("productId");
CREATE INDEX "TrainingRecord_taskUuid_idx" ON "TrainingRecord"("taskUuid");
CREATE INDEX "TrainingRecord_status_idx" ON "TrainingRecord"("status");
CREATE UNIQUE INDEX "TrainingRecord_taskUuid_labelName_key" ON "TrainingRecord"("taskUuid", "labelName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
