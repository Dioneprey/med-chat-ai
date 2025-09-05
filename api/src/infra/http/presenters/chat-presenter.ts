import { Chat } from 'src/domain/chat/entities/chat';

export class ChatPresenter {
  static toHTTP(chat: Chat | null) {
    if (chat === null) {
      return {};
    }

    return {
      id: chat.id.toString(),
      userId: chat.userId.toString(),
      companyId: chat.companyId.toString(),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }
}
