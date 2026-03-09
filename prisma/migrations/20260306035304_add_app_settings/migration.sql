-- CreateTable
CREATE TABLE "AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "dataPath" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'zh',
    "backendMode" TEXT NOT NULL DEFAULT 'local',
    "backendUrl" TEXT NOT NULL DEFAULT 'http://localhost:8000',
    "backendPort" TEXT NOT NULL DEFAULT '8000',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
