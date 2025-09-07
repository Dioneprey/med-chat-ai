import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserRepository } from 'src/domain/chat/application/repositories/user.repository';
import { PrismaUserRepository } from './prisma/repositories/prisma-user.repository';
import { ChatRepository } from 'src/domain/chat/application/repositories/chat.repository';
import { PrismaChatRepository } from './prisma/repositories/prisma-chat.repository';
import { RedisRepository } from './redis/redis.service';
import { EnvModule } from '../env/env.module';

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
      provide: ChatRepository,
      useClass: PrismaChatRepository,
    },
  ],
  exports: [PrismaService, RedisRepository, UserRepository, ChatRepository],
})
export class DatabaseModule {}
