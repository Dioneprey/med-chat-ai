import {
  SendMessage,
  SendMessageProps,
} from 'src/domain/chat/application/conversation/send-message';

export class FakeSendMessage extends SendMessage {
  async send({ messages }: SendMessageProps): Promise<string> {
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .at(-1)?.content;

    return `Lorem ipsum dolor sit amet... (resposta fake para: "${lastUserMessage}")`;
  }
}
