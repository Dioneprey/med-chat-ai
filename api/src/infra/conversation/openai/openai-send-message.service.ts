import { Injectable } from '@nestjs/common';
import {
  SendMessage,
  SendMessageProps,
} from 'src/domain/chat/application/conversation/send-message';

import OpenAI from 'openai';
import { EnvService } from 'src/infra/env/env.service';

@Injectable()
export class OpenAISendMessage implements SendMessage {
  private client: OpenAI;

  constructor(private envService: EnvService) {
    this.client = new OpenAI({
      apiKey: this.envService.get('OPENAI_API_KEY'),
    });
  }

  async send({ messages }: SendMessageProps): Promise<string> {
    if (this.envService.get('NODE_ENV') === 'test') {
      return 'Olá, essa é uma resposta da ia';
    }

    const completion = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return completion.choices[0].message.content ?? '';
  }
}
