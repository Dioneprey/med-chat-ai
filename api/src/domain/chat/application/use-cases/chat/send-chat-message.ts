import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../../repositories/chat.repository';
import { Either, left, right } from 'src/core/either';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { SendMessage } from '../../conversation/send-message';
import { MessagesLimitError } from '../@errors/messages-limit.error';
import { Chat } from 'src/domain/chat/entities/chat';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Message, MessageType } from 'src/domain/chat/entities/message';

export interface SendChatMessageUseCaseRequest {
  userId: string;
  companyId: string;
  chatId?: string;
  message: string;
}

type SendChatMessageUseCaseResponse = Either<
  ResourceNotFoundError | MessagesLimitError,
  {
    message: Message;
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
      chat = Chat.create({
        userId: new UniqueEntityID(userId),
        companyId: new UniqueEntityID(companyId),
      });

      await this.chatRepository.create(chat);
    }

    const { data: history } = await this.chatRepository.getMessages({
      chatId: chat.id.toString(),
      pageIndex: 1,
      companyId,
    });

    const userMessage = Message.create({
      chatId: chat.id,
      type: MessageType.USER,
      content: message,
    });

    await this.chatRepository.addMessage(userMessage);

    // reaproveita o history que poderia estar em cache antes do "addMessage", mas adicionando a nova msg
    const updatedHistory = [
      ...history,
      {
        type: userMessage.type,
        content: userMessage.content,
      },
    ];

    const aiMessageResponse = await this.sendMessage.send({
      messages: updatedHistory.map((m) => ({
        role: m.type === 'USER' ? 'user' : 'assistant',
        content: m.content,
      })),
    });

    const aiMessage = Message.create({
      chatId: chat.id,
      type: MessageType.AI,
      content: aiMessageResponse,
    });

    await this.chatRepository.addMessage(aiMessage);

    return right({
      message: aiMessage,
    });
  }
}
