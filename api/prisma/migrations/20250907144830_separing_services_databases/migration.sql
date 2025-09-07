/*
  Warnings:

  - You are about to drop the `Code` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Code" DROP CONSTRAINT "Code_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_companyId_fkey";

-- DropTable
DROP TABLE "public"."Code";

-- DropTable
DROP TABLE "public"."Company";

-- DropTable
DROP TABLE "public"."Invitation";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."CodeType";

-- DropEnum
DROP TYPE "public"."Role";
