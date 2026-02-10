-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DatasetVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "versionName" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL DEFAULT 'data_augmentation',
    "savePath" TEXT NOT NULL,
    "imageCount" INTEGER NOT NULL,
    "config" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DatasetVersion" ("config", "createdAt", "id", "imageCount", "moduleName", "productId", "savePath", "versionName") SELECT "config", "createdAt", "id", "imageCount", "moduleName", "productId", "savePath", "versionName" FROM "DatasetVersion";
DROP TABLE "DatasetVersion";
ALTER TABLE "new_DatasetVersion" RENAME TO "DatasetVersion";
CREATE INDEX "DatasetVersion_productId_idx" ON "DatasetVersion"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
