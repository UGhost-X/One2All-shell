-- CreateTable
CREATE TABLE "DatasetVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "versionName" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL DEFAULT 'data_augmentation',
    "savePath" TEXT NOT NULL,
    "imageCount" INTEGER NOT NULL,
    "config" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "DatasetVersion_productId_idx" ON "DatasetVersion"("productId");
