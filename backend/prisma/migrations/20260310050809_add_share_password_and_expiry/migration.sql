-- DropIndex
DROP INDEX "Share_documentId_sharedWithEmail_key";

-- AlterTable
ALTER TABLE "Share" ADD COLUMN "expiresAt" DATETIME;
ALTER TABLE "Share" ADD COLUMN "password" TEXT;
