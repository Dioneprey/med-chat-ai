import { faker } from '@faker-js/faker';

import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Message,
  MessageProps,
  MessageType,
} from 'src/domain/chat/entities/message';
import { PrismaMessageMapper } from 'src/infra/database/prisma/mappers/prisma-message-mapper';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

export function makeMessage(
  override: Partial<MessageProps> = {},
  id?: UniqueEntityID,
) {
  const message = Message.create(
    {
      chatId: override.chatId || new UniqueEntityID(),
      type: override.type || MessageType.USER,
      content: faker.lorem.words(3),
      ...override,
    },
    id,
  );

  return message;
}

@Injectable()
export class MessageFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaMessage(data: Partial<MessageProps> = {}): Promise<Message> {
    const message = makeMessage(data);

    await this.prisma.message.create({
      data: PrismaMessageMapper.toPrisma(message),
    });

    return message;
  }
}
