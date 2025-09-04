import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserRepository } from 'src/domain/chat/application/repositories/user.repository';
import { PrismaUserRepository } from './prisma/repositories/prisma-user.repository';
import { CompanyRepository } from 'src/domain/chat/application/repositories/company.repository';
import { PrismaCompanyRepository } from './prisma/repositories/prisma-company.repository';
import { InvitationRepository } from 'src/domain/chat/application/repositories/invitation.repository';
import { PrismaInvitationRepository } from './prisma/repositories/prisma-invitation.repository';
import { ChatRepository } from 'src/domain/chat/application/repositories/chat.repository';
import { PrismaChatRepository } from './prisma/repositories/prisma-chat.repository';
import { RedisRepository } from './redis/redis.service';
import { EnvModule } from '../env/env.module';
import { PrismaCodeRepository } from './prisma/repositories/prisma-code.repository';
import { CodeRepository } from 'src/domain/chat/application/repositories/code.repository';

@Module({
  imports: [EnvModule],
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
      provide: ChatRepository,
      useClass: PrismaChatRepository,
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
    ChatRepository,
    CodeRepository,
  ],
})
export class DatabaseModule {}
