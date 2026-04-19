-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Camera" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "config" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isNetworkCamera" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Camera" ("config", "createdAt", "id", "ip", "isEnabled", "name", "status", "updatedAt") SELECT "config", "createdAt", "id", "ip", "isEnabled", "name", "status", "updatedAt" FROM "Camera";
DROP TABLE "Camera";
ALTER TABLE "new_Camera" RENAME TO "Camera";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
