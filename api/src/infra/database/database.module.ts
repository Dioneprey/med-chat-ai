import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserRepository } from 'src/domain/qa/application/repositories/user.repository';
import { PrismaUserRepository } from './prisma/repositories/prisma-user.repository';
import { CompanyRepository } from 'src/domain/qa/application/repositories/company.repository';
import { PrismaCompanyRepository } from './prisma/repositories/prisma-company.repository';
import { InvitationRepository } from 'src/domain/qa/application/repositories/invitation.repository';
import { PrismaInvitationRepository } from './prisma/repositories/prisma-invitation.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: CompanyRepository,
      useClass: PrismaCompanyRepository,
    },
    {
      provide: InvitationRepository,
      useClass: PrismaInvitationRepository,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    CompanyRepository,
    InvitationRepository,
  ],
})
export class DatabaseModule {}
