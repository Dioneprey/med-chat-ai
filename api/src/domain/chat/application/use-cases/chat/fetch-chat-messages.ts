import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../../repositories/chat.repository';
import { Either, left, right } from 'src/core/either';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { Message } from 'src/domain/chat/entities/message';
import { ChatPresenter } from 'src/infra/http/presenters/chat-presenter';

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
    messages: Message[];
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

    return right({
      chatId: chat.id.toString(),
      messages: chatMessages,
      totalCount,
      totalPages,
    });
  }
}
