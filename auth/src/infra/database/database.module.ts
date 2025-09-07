import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserRepository } from 'src/domain/auth/application/repositories/user.repository';
import { PrismaUserRepository } from './prisma/repositories/prisma-user.repository';
import { CompanyRepository } from 'src/domain/auth/application/repositories/company.repository';
import { PrismaCompanyRepository } from './prisma/repositories/prisma-company.repository';
import { InvitationRepository } from 'src/domain/auth/application/repositories/invitation.repository';
import { PrismaInvitationRepository } from './prisma/repositories/prisma-invitation.repository';
import { RedisRepository } from './redis/redis.service';
import { EnvModule } from '../env/env.module';
import { PrismaCodeRepository } from './prisma/repositories/prisma-code.repository';
import { CodeRepository } from 'src/domain/auth/application/repositories/code.repository';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EnvModule, EventsModule],
  providers: [
    PrismaService,
    RedisRepository,
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
    {
      provide: CodeRepository,
      useClass: PrismaCodeRepository,
    },
  ],
  exports: [
    PrismaService,
    RedisRepository,
    UserRepository,
    CompanyRepository,
    InvitationRepository,
    CodeRepository,
  ],
})
export class DatabaseModule {}
