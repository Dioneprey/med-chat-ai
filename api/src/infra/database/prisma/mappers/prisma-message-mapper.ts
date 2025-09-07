import { Prisma, Message as PrismaMessage } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Message, MessageType } from 'src/domain/chat/entities/message';

export class PrismaMessageMapper {
  static toDomain(raw: PrismaMessage): Message {
    return Message.create(
      {
        ...raw,
        chatId: new UniqueEntityID(raw.chatId),
        type: MessageType[raw.type],
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(message: Message): Prisma.MessageUncheckedCreateInput {
    return {
      id: message.id.toString(),
      chatId: message.chatId.toString(),
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
    };
  }
}
