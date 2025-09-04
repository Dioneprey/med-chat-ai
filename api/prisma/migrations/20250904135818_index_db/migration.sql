/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Chat_userId_companyId_idx" ON "public"."Chat"("userId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "public"."Company"("name");

-- CreateIndex
CREATE INDEX "Invitation_invitedEmail_companyId_idx" ON "public"."Invitation"("invitedEmail", "companyId");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "public"."Message"("chatId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");
