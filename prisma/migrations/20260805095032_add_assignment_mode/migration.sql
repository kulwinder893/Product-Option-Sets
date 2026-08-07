-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OptionSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "assignmentMode" TEXT NOT NULL DEFAULT 'MANUAL',
    "assignmentConditions" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "internalNote" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_OptionSet" ("createdAt", "deletedAt", "description", "id", "internalNote", "name", "priority", "shop", "status", "updatedAt") SELECT "createdAt", "deletedAt", "description", "id", "internalNote", "name", "priority", "shop", "status", "updatedAt" FROM "OptionSet";
DROP TABLE "OptionSet";
ALTER TABLE "new_OptionSet" RENAME TO "OptionSet";
CREATE INDEX "OptionSet_shop_status_idx" ON "OptionSet"("shop", "status");
CREATE INDEX "OptionSet_shop_name_idx" ON "OptionSet"("shop", "name");
CREATE INDEX "OptionSet_shop_updatedAt_idx" ON "OptionSet"("shop", "updatedAt");
CREATE INDEX "OptionSet_shop_deletedAt_idx" ON "OptionSet"("shop", "deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
