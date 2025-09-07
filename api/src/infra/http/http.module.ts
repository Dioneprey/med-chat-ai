import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { EnvModule } from '../env/env.module';
import { ConversationModule } from '../conversation/conversation.module';
import { SendChatMessageController } from './controllers/chat/send-chat-message.controller';
import { SendChatMessageUseCase } from 'src/domain/chat/application/use-cases/chat/send-chat-message';
import { FetchChatMessageUseCase } from 'src/domain/chat/application/use-cases/chat/fetch-chat-messages';
import { FetchChatMessageController } from './controllers/chat/fetch-chat-message.controller';
import { FetchAllChatsController } from './controllers/chat/fetch-all-chats.controller';
import { FetchAllChatsUseCaseUseCase } from 'src/domain/chat/application/use-cases/chat/fetch-all-chats';
import { GetAdminDashboardStatsController } from './controllers/dashboard/get-admin-dashboard-stats.controller';
import { GetAdminDashboardStatsUseCase } from 'src/domain/chat/application/use-cases/dashboard/get-admin-dashboard-stats';

@Module({
  imports: [AuthModule, DatabaseModule, EnvModule, ConversationModule],
  controllers: [
    HealthController,

    // Chat
    SendChatMessageController,
    FetchChatMessageController,
    FetchAllChatsController,

    // Dashboard
    GetAdminDashboardStatsController,
  ],
  providers: [
    // Chat
    SendChatMessageUseCase,
    FetchChatMessageUseCase,
    FetchAllChatsUseCaseUseCase,

    // Dashboard
    GetAdminDashboardStatsUseCase,
  ],
  exports: [],
})
export class HttpModule {}
