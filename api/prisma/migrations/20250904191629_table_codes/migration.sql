-- CreateEnum
CREATE TYPE "public"."CodeType" AS ENUM ('REFRESH_TOKEN');

-- CreateTable
CREATE TABLE "public"."Code" (
    "id" SERIAL NOT NULL,
    "type" "public"."CodeType" NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Code_userId_type_value_idx" ON "public"."Code"("userId", "type", "value");

-- AddForeignKey
ALTER TABLE "public"."Code" ADD CONSTRAINT "Code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
