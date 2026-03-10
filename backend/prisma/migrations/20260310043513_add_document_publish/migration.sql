-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT '无标题文档',
    "content" TEXT,
    "ownerId" TEXT NOT NULL,
    "folderId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "archivedAt" DATETIME,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "publicSlug" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("archivedAt", "content", "createdAt", "deletedAt", "folderId", "id", "isArchived", "isDeleted", "ownerId", "title", "updatedAt") SELECT "archivedAt", "content", "createdAt", "deletedAt", "folderId", "id", "isArchived", "isDeleted", "ownerId", "title", "updatedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_publicSlug_key" ON "Document"("publicSlug");
CREATE INDEX "Document_ownerId_idx" ON "Document"("ownerId");
CREATE INDEX "Document_folderId_idx" ON "Document"("folderId");
CREATE INDEX "Document_isDeleted_idx" ON "Document"("isDeleted");
CREATE INDEX "Document_isArchived_idx" ON "Document"("isArchived");
CREATE INDEX "Document_isPublic_idx" ON "Document"("isPublic");
CREATE INDEX "Document_publicSlug_idx" ON "Document"("publicSlug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
