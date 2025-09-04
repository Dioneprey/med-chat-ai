import { Module } from '@nestjs/common';
import { SendMessage } from 'src/domain/chat/application/conversation/send-message';
import { OpenAISendMessage } from './openai/openai-send-message.service';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: SendMessage,
      useClass: OpenAISendMessage,
    },
  ],
  exports: [SendMessage],
})
export class ConversationModule {}
