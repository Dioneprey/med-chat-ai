-- DropIndex
DROP INDEX "public"."Company_name_key";

-- DropIndex
DROP INDEX "public"."User_email_key";

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "public"."Company"("name");
