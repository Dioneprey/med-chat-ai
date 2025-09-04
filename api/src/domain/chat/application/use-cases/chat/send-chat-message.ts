import { Injectable } from '@nestjs/common';
import { Chat } from '@generated/index';
import { ChatRepository } from '../../repositories/chat.repository';
import { Either, left, right } from 'src/core/either';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { SendMessage } from '../../conversation/send-message';
import { MessagesLimitError } from '../@errors/messages-limit.error';

export interface SendChatMessageUseCaseRequest {
  userId: string;
  companyId: string;
  chatId?: string;
  message: string;
}

type SendChatMessageUseCaseResponse = Either<
  ResourceNotFoundError | MessagesLimitError,
  {
    chatId: string;
    messageId: string;
    content: string;
    type: 'USER' | 'AI';
    createdAt: Date;
  }
>;

@Injectable()
export class SendChatMessageUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly sendMessage: SendMessage,
  ) {}

  async execute({
    userId,
    companyId,
    chatId,
    message,
  }: SendChatMessageUseCaseRequest): Promise<SendChatMessageUseCaseResponse> {
    let chat: Chat | null = null;

    if (chatId) {
      chat = await this.chatRepository.getChatById({
        chatId,
        companyId,
        userId,
      });
      if (!chat) {
        return left(new ResourceNotFoundError(`Chat with id: ${chatId}`));
      }

      const messagesCount = await this.chatRepository.countMessages(chatId);

      if (messagesCount >= 50) {
        return left(new MessagesLimitError());
      }
    } else {
      chat = await this.chatRepository.create(userId, companyId);
    }

    const { data: history } = await this.chatRepository.getMessages({
      chatId: chat.id,
      pageIndex: 1,
      companyId,
    });

    const userMessage = await this.chatRepository.addMessage(
      chat.id,
      'USER',
      message,
    );

    // reaproveita o history que poderia estar em cache antes do "addMessage", mas adicionando a nova msg
    const updatedHistory = [
      ...history,
      {
        id: userMessage.id,
        type: userMessage.type,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
    ];

    const aiMessageResponse = await this.sendMessage.send({
      messages: updatedHistory.map((m) => ({
        role: m.type === 'USER' ? 'user' : 'assistant',
        content: m.content,
      })),
    });

    const aiMessage = await this.chatRepository.addMessage(
      chat.id,
      'AI',
      aiMessageResponse,
    );

    return right({
      chatId: chat.id,
      messageId: aiMessage.id,
      content: aiMessage.content,
      type: aiMessage.type,
      createdAt: aiMessage.createdAt,
    });
  }
}
