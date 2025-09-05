import { PaginationResponse } from 'src/core/types/pagination';
import {
  ChatRepository,
  ChatRepositoryGetChatByIdProps,
  ChatRepositoryGetChatsProps,
  ChatRepositoryGetMessagesCountProps,
  ChatRepositoryGetMessagesProps,
  ChatRepositoryGetQuestionsByDayProps,
  ChatRepositoryGetTopUsersByQuestionsProps,
  QuestionsByDay,
  TopUsersQuestions,
} from 'src/domain/chat/application/repositories/chat.repository';
import { Chat } from 'src/domain/chat/entities/chat';
import { Message } from 'src/domain/chat/entities/message';

export class InMemoryChatRepository implements ChatRepository {
  public items: Chat[] = [];
  public messages: Message[] = [];

  async create(chat: Chat): Promise<Chat> {
    this.items.push(chat);
    return chat;
  }

  async getChatById({
    chatId,
    companyId,
    userId,
  }: ChatRepositoryGetChatByIdProps): Promise<Chat | null> {
    const chat = this.items.find(
      (item) =>
        item.id.toString() === chatId &&
        item.userId.toString() === userId &&
        item.companyId.toString() === companyId,
    );
    if (!chat) return null;

    return chat;
  }

  async getChats({
    pageIndex,
    companyId,
    userId,
    pageSize = 10,
  }: ChatRepositoryGetChatsProps): Promise<PaginationResponse<Chat>> {
    let chats = [...this.items];

    chats = chats.filter(
      (c) =>
        c.companyId.toString() === companyId && c.userId.toString() === userId,
    );

    const start = (pageIndex - 1) * pageSize;
    const paginated = chats.slice(start, start + pageSize);

    const totalCount = chats.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: paginated,
      pageIndex,
      totalCount,
      totalPages: totalPages,
    };
  }

  async addMessage(message: Message): Promise<Message> {
    this.messages.push(message);
    return message;
  }

  async countMessages(chatId: string): Promise<number> {
    return this.messages.filter((m) => m.chatId.toString() === chatId).length;
  }

  async getMessages({
    chatId,
    pageIndex,
    pageSize = 10,
  }: ChatRepositoryGetMessagesProps): Promise<PaginationResponse<Message>> {
    let msgs = this.messages.filter((m) => m.chatId.toString() === chatId);

    const start = (pageIndex - 1) * pageSize;
    const paginated = msgs.slice(start, start + pageSize);

    const totalCount = msgs.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: paginated,
      pageIndex,
      totalCount,
      totalPages,
    };
  }

  async getMessagesCount({
    companyId,
    type,
    from,
    to,
  }: ChatRepositoryGetMessagesCountProps): Promise<number> {
    return this.messages.filter((m) => {
      const chat = this.items.find((c) => c.id === m.chatId);
      if (!chat || chat.companyId.toString() !== companyId) return false;

      if (type && !type.includes(m.type)) return false;
      if (from && m.createdAt < from) return false;
      if (to && m.createdAt > to) return false;

      return true;
    }).length;
  }

  async getTopUsersByQuestions({
    companyId,
    limit,
    from,
    to,
  }: ChatRepositoryGetTopUsersByQuestionsProps): Promise<TopUsersQuestions[]> {
    const counts: Record<string, { name: string; questionsCount: number }> = {};

    this.messages.forEach((m) => {
      const chat = this.items.find((c) => c.id === m.chatId);
      if (!chat || chat.companyId.toString() !== companyId) return;

      // apenas mensagens de usuário
      if (m.type !== 'USER') return;

      if (from && m.createdAt < from) return;
      if (to && m.createdAt > to) return;

      const userId = chat.userId.toString();
      const name = 'John doe';

      if (!counts[userId]) {
        counts[userId] = { name, questionsCount: 0 };
      }

      counts[userId].questionsCount++;
    });

    return Object.entries(counts)
      .map(([userId, { name, questionsCount }]) => ({
        userId,
        name,
        questionsCount,
      }))
      .sort((a, b) => b.questionsCount - a.questionsCount)
      .slice(0, limit);
  }

  async getQuestionsByDay({
    companyId,
    from,
    to,
    type,
  }: ChatRepositoryGetQuestionsByDayProps): Promise<QuestionsByDay[]> {
    const result: Record<string, number> = {};

    this.messages.forEach((m) => {
      const chat = this.items.find((c) => c.id === m.chatId);
      if (!chat || chat.companyId.toString() !== companyId) return;

      if (type && type.length > 0 && !type.includes(m.type)) return;
      if (from && m.createdAt < from) return;
      if (to && m.createdAt > to) return;

      const day = m.createdAt.toISOString().split('T')[0];
      result[day] = (result[day] ?? 0) + 1;
    });

    const output: QuestionsByDay[] = [];
    const current = new Date(from);
    const end = new Date(to);

    while (current <= end) {
      const dayString = current.toISOString().slice(0, 10);
      output.push({
        day: dayString,
        messages: result[dayString] ?? 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return output;
  }

  async getUserChats(userId: string, companyId: string): Promise<Chat[]> {
    return this.items.filter(
      (c) =>
        c.userId.toString() === userId && c.companyId.toString() === companyId,
    );
  }
}
