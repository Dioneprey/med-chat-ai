import { Injectable } from '@nestjs/common';
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
import { PrismaService } from '../prisma.service';
import { RedisRepository } from '../../redis/redis.service';
import { Chat, Message } from '@generated/index';
import { PaginationResponse } from 'src/core/types/pagination';

@Injectable()
export class PrismaChatRepository implements ChatRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}

  async create(userId: string, companyId: string) {
    const chat = await this.prisma.chat.create({
      data: {
        userId,
        companyId,
        createdAt: new Date(),
      },
    });

    await Promise.all([
      this.redisRepository.del(`user:${userId}:chats`),

      this.redisRepository.purgeByPrefix(`company:${companyId}:messagesCount`),
      this.redisRepository.purgeByPrefix(`company:${companyId}:topUsers`),
      this.redisRepository.purgeByPrefix(`company:${companyId}:questionsByDay`),
    ]);

    return chat;
  }

  async getChatById({
    chatId,
    companyId,
    userId,
    include,
  }: ChatRepositoryGetChatByIdProps) {
    const cacheKey = `chat:${chatId}`;
    const cached = await this.redisRepository.get<Chat>(cacheKey);

    if (cached) return cached;

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId, companyId, userId },
      include: { messages: include?.messages },
    });

    await this.redisRepository.set(cacheKey, chat, 180); // TTL 180s

    return chat;
  }

  async getChats({
    userId,
    companyId,
    pageIndex,
    pageSize,
  }: ChatRepositoryGetChatsProps) {
    const cacheKey = `user:${userId}:chats`;
    const cached =
      await this.redisRepository.get<PaginationResponse<Chat>>(cacheKey);

    if (cached) return cached;

    const [chats, totalCount] = await Promise.all([
      this.prisma.chat.findMany({
        where: { companyId, userId },
        orderBy: { createdAt: 'asc' },
        ...(pageIndex && pageSize
          ? {
              skip: (pageIndex - 1) * pageSize,
              take: pageSize,
            }
          : {}),
      }),
      this.prisma.chat.count({
        where: { companyId, userId },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / 10);

    const paginatedResponsed = {
      data: chats,
      pageIndex,
      totalCount,
      totalPages,
    };

    await this.redisRepository.set(cacheKey, paginatedResponsed, 180);

    return paginatedResponsed;
  }

  async addMessage(chatId: string, type: 'USER' | 'AI', content: string) {
    const message = await this.prisma.message.create({
      data: {
        chatId,
        type,
        content,
        createdAt: new Date(),
      },
      include: {
        chat: {
          select: {
            userId: true,
            companyId: true,
          },
        },
      },
    });

    await Promise.all([
      this.redisRepository.purgeByPrefix(`chat:${chatId}`),

      this.redisRepository.del(`user:${message.chat.userId}:chats`),

      this.redisRepository.purgeByPrefix(
        `company:${message.chat.companyId}:messagesCount`,
      ),
      this.redisRepository.purgeByPrefix(
        `company:${message.chat.companyId}:topUsers`,
      ),
      this.redisRepository.purgeByPrefix(
        `company:${message.chat.companyId}:questionsByDay`,
      ),
    ]);

    return message;
  }

  async countMessages(chatId: string) {
    const cacheKey = `chat:${chatId}:messages:count`;
    const cached = await this.redisRepository.get<number>(cacheKey);

    if (cached) return cached;

    const messagesCount = await this.prisma.message.count({
      where: { chatId },
    });

    await this.redisRepository.set(cacheKey, messagesCount, 180); // TTL 180s

    return messagesCount;
  }

  async getMessages({
    chatId,
    pageIndex,
    pageSize,
  }: ChatRepositoryGetMessagesProps) {
    const cacheKey = `chat:${chatId}:messages:pageIndex:${pageIndex}:pageSize:${pageSize}`;
    const cached =
      await this.redisRepository.get<PaginationResponse<Message>>(cacheKey);

    if (cached) return cached;

    const [messages, totalCount] = await Promise.all([
      this.prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
        ...(pageIndex && pageSize
          ? {
              skip: (pageIndex - 1) * pageSize,
              take: pageSize,
            }
          : {}),
      }),
      this.prisma.message.count({
        where: { chatId },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / 10);

    const paginatedResponsed = {
      data: messages,
      pageIndex,
      totalCount,
      totalPages,
    };

    await this.redisRepository.set(cacheKey, paginatedResponsed, 180);

    return paginatedResponsed;
  }

  async getMessagesCount({
    companyId,
    type,
    from,
    to,
  }: ChatRepositoryGetMessagesCountProps): Promise<number> {
    const cacheKey = `company:${companyId}:messagesCount:${type?.join(',')}:${from?.toISOString()}:${to?.toISOString()}`;

    const cached = await this.redisRepository.get<number>(cacheKey);
    if (cached) return cached;
    const typeFilter =
      type && type.length > 0
        ? `AND m."type" IN (${type.map((t) => `'${t}'`).join(',')})`
        : '';

    const query = `
    SELECT COUNT(m.id) AS count
    FROM "Message" m
    INNER JOIN "Chat" c ON c.id = m."chatId"
    WHERE c."companyId" = '${companyId}'
      AND m."createdAt" BETWEEN '${from.toISOString()}'::timestamp AND '${to.toISOString()}'::timestamp
      ${typeFilter};
  `;

    const countResult: { count: bigint }[] =
      await this.prisma.$queryRawUnsafe(query);

    const count = Number(countResult[0]?.count || 0);

    await this.redisRepository.set(cacheKey, count, 180);

    return count;
  }

  async getTopUsersByQuestions({
    companyId,
    limit,
    from,
    to,
  }: ChatRepositoryGetTopUsersByQuestionsProps): Promise<TopUsersQuestions[]> {
    const cacheKey = `company:${companyId}:topUsers:${from.toISOString()}:${to.toISOString()}:${limit}`;

    const cached =
      await this.redisRepository.get<TopUsersQuestions[]>(cacheKey);
    if (cached) return cached;

    const query = `
    SELECT c."userId",
           u."name" AS "name",
           COUNT(m.id) AS "questionsCount"
    FROM "Message" m
    INNER JOIN "Chat" c ON c.id = m."chatId"
    INNER JOIN "User" u ON u.id = c."userId"
    WHERE c."companyId" = '${companyId}'
      AND m."type" = 'USER'
      AND m."createdAt" BETWEEN '${from.toISOString()}'::timestamp AND '${to.toISOString()}'::timestamp
    GROUP BY c."userId", u."name"
    ORDER BY "questionsCount" DESC
    LIMIT ${limit};
  `;

    const rawUsers: { userId: string; name: string; questionsCount: bigint }[] =
      await this.prisma.$queryRawUnsafe(query);

    const users: TopUsersQuestions[] = rawUsers.map((u) => ({
      userId: u.userId,
      name: u.name,
      questionsCount: Number(u.questionsCount),
    }));

    await this.redisRepository.set(cacheKey, users, 180);

    return users;
  }

  async getQuestionsByDay({
    companyId,
    from,
    to,
    type,
  }: ChatRepositoryGetQuestionsByDayProps): Promise<QuestionsByDay[]> {
    const cacheKey = `company:${companyId}:questionsByDay:${type?.join(',')}:${from.toISOString()}:${to?.toISOString()}`;

    const cached = await this.redisRepository.get<QuestionsByDay[]>(cacheKey);
    if (cached) return cached;

    const typeFilter =
      type && type.length > 0
        ? `AND m."type" IN (${type.map((t) => `'${t}'`).join(',')})`
        : '';

    const query = `
    SELECT
      TO_CHAR(m."createdAt"::date, 'YYYY-MM-DD') AS day,
      COUNT(m.id) AS messages
    FROM "Message" m
    INNER JOIN "Chat" c ON c.id = m."chatId"
    WHERE c."companyId" = '${companyId}'
      AND m."createdAt" BETWEEN '${from.toISOString()}'::timestamp AND '${to.toISOString()}'::timestamp
      ${typeFilter}
    GROUP BY day
    ORDER BY day;
  `;

    const rawData: { day: string; messages: bigint }[] =
      await this.prisma.$queryRawUnsafe(query);

    const result: QuestionsByDay[] = [];
    const current = new Date(from);
    const end = new Date(to);
    while (current <= end) {
      const dayString = current.toISOString().slice(0, 10);
      const found = rawData.find((r) => r.day === dayString);
      result.push({
        day: dayString,
        messages: found ? Number(found.messages) : 0,
      });
      current.setDate(current.getDate() + 1);
    }

    await this.redisRepository.set(cacheKey, result, 180);

    return result;
  }

  async getUserChats(userId: string, companyId: string) {
    const cacheKey = `user:${userId}:chats`;
    const cached = await this.redisRepository.get<Chat[]>(cacheKey);
    if (cached) return cached;

    const chats = await this.prisma.chat.findMany({
      where: { userId, companyId },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
    });

    await this.redisRepository.set(cacheKey, chats, 180); // TTL 180s

    return chats;
  }
}
