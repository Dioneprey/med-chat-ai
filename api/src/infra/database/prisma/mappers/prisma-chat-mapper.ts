import {
  Prisma,
  Chat as PrismaChat,
  Message as PrismaMessage,
} from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Chat } from 'src/domain/chat/entities/chat';
import { PrismaMessageMapper } from './prisma-message-mapper';

export type ChatWithInclude = PrismaChat & {
  messages?: PrismaMessage[] | null;
};

export class PrismaChatMapper {
  static toDomain(raw: ChatWithInclude): Chat {
    return Chat.create(
      {
        ...raw,
        companyId: new UniqueEntityID(raw.companyId),
        userId: new UniqueEntityID(raw.userId),
        messages: raw.messages
          ? raw.messages.map(PrismaMessageMapper.toDomain)
          : undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(chat: Chat): Prisma.ChatUncheckedCreateInput {
    return {
      id: chat.id.toString(),
      companyId: chat.companyId.toString(),
      userId: chat.userId.toString(),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }
}
