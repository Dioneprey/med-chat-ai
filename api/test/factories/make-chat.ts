import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Chat, ChatProps } from 'src/domain/chat/entities/chat';
import { PrismaChatMapper } from 'src/infra/database/prisma/mappers/prisma-chat-mapper';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

export function makeChat(
  override: Partial<ChatProps> = {},
  id?: UniqueEntityID,
) {
  const chat = Chat.create(
    {
      userId: override.userId || new UniqueEntityID(),
      companyId: override.companyId || new UniqueEntityID(),
      ...override,
    },
    id,
  );

  return chat;
}

@Injectable()
export class ChatFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaChat(data: Partial<ChatProps> = {}): Promise<Chat> {
    const chat = makeChat(data);

    await this.prisma.chat.create({
      data: PrismaChatMapper.toPrisma(chat),
    });

    return chat;
  }
}
