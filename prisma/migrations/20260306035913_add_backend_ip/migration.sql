-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "dataPath" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'zh',
    "backendMode" TEXT NOT NULL DEFAULT 'local',
    "backendIp" TEXT NOT NULL DEFAULT 'localhost',
    "backendUrl" TEXT NOT NULL DEFAULT 'http://localhost:8000',
    "backendPort" TEXT NOT NULL DEFAULT '8000',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AppSettings" ("backendMode", "backendPort", "backendUrl", "createdAt", "dataPath", "id", "locale", "updatedAt") SELECT "backendMode", "backendPort", "backendUrl", "createdAt", "dataPath", "id", "locale", "updatedAt" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
