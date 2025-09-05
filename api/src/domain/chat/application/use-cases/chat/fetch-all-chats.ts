import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../../repositories/chat.repository';
import { Either, right } from 'src/core/either';
import { Chat } from 'src/domain/chat/entities/chat';

export interface FetchAllChatsUseCaseUseCaseRequest {
  userId: string;
  companyId: string;
  pageIndex: number;
  pageSize: number;
}

type FetchAllChatsUseCaseUseCaseResponse = Either<
  undefined,
  {
    totalCount: number;
    totalPages: number;
    chats: Chat[];
  }
>;

@Injectable()
export class FetchAllChatsUseCaseUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute({
    userId,
    companyId,
    pageIndex,
    pageSize,
  }: FetchAllChatsUseCaseUseCaseRequest): Promise<FetchAllChatsUseCaseUseCaseResponse> {
    const {
      data: chats,
      totalCount,
      totalPages,
    } = await this.chatRepository.getChats({
      companyId,
      pageIndex,
      pageSize,
      userId,
    });

    return right({
      chats,
      totalCount,
      totalPages,
    });
  }
}
