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
import { Chat as PrismaChat, Message as PrismaMessage } from '@generated/index';
import { PaginationResponse } from 'src/core/types/pagination';
import { Chat } from 'src/domain/chat/entities/chat';
import { PrismaChatMapper } from '../mappers/prisma-chat-mapper';
import { Message } from 'src/domain/chat/entities/message';
import { PrismaMessageMapper } from '../mappers/prisma-message-mapper';

@Injectable()
export class PrismaChatRepository implements ChatRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}

  async create(chat: Chat) {
    const data = PrismaChatMapper.toPrisma(chat);

    const createdChat = await this.prisma.chat.create({
      data: data,
    });

    await Promise.all([
      this.redisRepository.del(`user:${data.userId}:chats`),

      this.redisRepository.purgeByPrefix(
        `company:${data.companyId}:messagesCount`,
      ),
      this.redisRepository.purgeByPrefix(`company:${data.companyId}:topUsers`),
      this.redisRepository.purgeByPrefix(
        `company:${data.companyId}:questionsByDay`,
      ),
    ]);

    return PrismaChatMapper.toDomain(createdChat);
  }

  async getChatById({
    chatId,
    companyId,
    userId,
    include,
  }: ChatRepositoryGetChatByIdProps) {
    const cacheKey = `chat:${chatId}`;
    const cached = await this.redisRepository.get<PrismaChat>(cacheKey);

    if (cached) return PrismaChatMapper.toDomain(cached);

    const prismaChat = await this.prisma.chat.findUnique({
      where: { id: chatId, companyId, userId },
      include: { messages: include?.messages },
    });

    if (!prismaChat) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaChat, 180); // TTL 180s

    return PrismaChatMapper.toDomain(prismaChat);
  }

  async getChats({
    userId,
    companyId,
    pageIndex,
    pageSize,
  }: ChatRepositoryGetChatsProps) {
    const cacheKey = `user:${userId}:chats`;
    const cached =
      await this.redisRepository.get<PaginationResponse<PrismaChat>>(cacheKey);

    if (cached)
      return {
        ...cached,
        data: cached.data.map(PrismaChatMapper.toDomain),
      };

    const [prismaChats, totalCount] = await Promise.all([
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
      data: prismaChats,
      pageIndex,
      totalCount,
      totalPages,
    };

    await this.redisRepository.set(cacheKey, paginatedResponsed, 180);

    return {
      ...paginatedResponsed,
      data: prismaChats.map(PrismaChatMapper.toDomain),
    };
  }

  async addMessage(message: Message) {
    const data = PrismaMessageMapper.toPrisma(message);

    const createdMessage = await this.prisma.message.create({
      data: data,
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
      this.redisRepository.purgeByPrefix(`chat:${data.chatId}`),

      this.redisRepository.purgeByPrefix(
        `company:${createdMessage.chat.companyId}`,
      ),

      this.redisRepository.del(`user:${createdMessage.chat.userId}:chats`),

      this.redisRepository.purgeByPrefix(
        `company:${createdMessage.chat.companyId}:messagesCount`,
      ),
      this.redisRepository.purgeByPrefix(
        `company:${createdMessage.chat.companyId}:topUsers`,
      ),
      this.redisRepository.purgeByPrefix(
        `company:${createdMessage.chat.companyId}:questionsByDay`,
      ),
    ]);

    return PrismaMessageMapper.toDomain(createdMessage);
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
      await this.redisRepository.get<PaginationResponse<PrismaMessage>>(
        cacheKey,
      );

    if (cached)
      return {
        ...cached,
        data: cached.data.map(PrismaMessageMapper.toDomain),
      };

    const [prismaMessages, totalCount] = await Promise.all([
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
      data: prismaMessages,
      pageIndex,
      totalCount,
      totalPages,
    };

    await this.redisRepository.set(cacheKey, paginatedResponsed, 180);

    return {
      ...paginatedResponsed,
      data: prismaMessages.map(PrismaMessageMapper.toDomain),
    };
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

    const prismaChats = await this.prisma.chat.findMany({
      where: { userId, companyId },
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
    });

    await this.redisRepository.set(cacheKey, prismaChats, 180); // TTL 180s

    return prismaChats.map(PrismaChatMapper.toDomain);
  }
}
