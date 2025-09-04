import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../../repositories/chat.repository';
import { Either, left, right } from 'src/core/either';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';

export interface FetchChatMessageUseCaseRequest {
  chatId: string;
  userId: string;
  companyId: string;
  pageIndex: number;
  pageSize: number;
}

type FetchChatMessageUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    chatId: string;
    totalCount: number;
    totalPages: number;
    messages: {
      id: string;
      content: string;
      type: 'USER' | 'AI';
      createdAt: Date;
    }[];
  }
>;

@Injectable()
export class FetchChatMessageUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute({
    userId,
    chatId,
    companyId,
    pageIndex,
    pageSize,
  }: FetchChatMessageUseCaseRequest): Promise<FetchChatMessageUseCaseResponse> {
    const chat = await this.chatRepository.getChatById({
      chatId,
      companyId,
      userId,
    });

    if (!chat) {
      return left(new ResourceNotFoundError(`Chat with id: ${chatId}`));
    }

    const {
      data: chatMessages,
      totalCount,
      totalPages,
    } = await this.chatRepository.getMessages({
      chatId,
      companyId,
      pageIndex,
      pageSize,
    });

    const messages = chatMessages.map((m) => ({
      id: m.id,
      content: m.content,
      type: m.type,
      createdAt: m.createdAt,
    }));

    return right({
      chatId: chat.id,
      messages,
      totalCount,
      totalPages,
    });
  }
}
