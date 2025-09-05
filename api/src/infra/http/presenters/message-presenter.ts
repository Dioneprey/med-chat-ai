import { Message } from 'src/domain/chat/entities/message';

export class MessagePresenter {
  static toHTTP(message: Message | null) {
    if (message === null) {
      return {};
    }

    return {
      id: message.id.toString(),
      chatId: message.chatId.toString(),
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
    };
  }
}
