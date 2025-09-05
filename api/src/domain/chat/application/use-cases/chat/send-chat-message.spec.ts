import { expect } from 'vitest';
import { SendChatMessageUseCase } from './send-chat-message';
import { InMemoryChatRepository } from 'test/repositories/in-memory-chat.repository';
import { FakeSendMessage } from 'test/conversation/fake-send-message';
import { makeUser } from 'test/factories/make-user';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { MessageType } from 'src/domain/chat/entities/message';

let inMemoryChatRepository: InMemoryChatRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let fakeSendMessage: FakeSendMessage;

let sut: SendChatMessageUseCase;

describe('Send chat message', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryChatRepository = new InMemoryChatRepository();
    fakeSendMessage = new FakeSendMessage();

    sut = new SendChatMessageUseCase(inMemoryChatRepository, fakeSendMessage);
  });

  it('should be able to send a question and get a anwser', async () => {
    const user = makeUser({
      email: 'john.doe@email.com',
    });

    inMemoryUserRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      message: 'Olá',
      companyId: user.companyId.toString(),
    });

    const aiSavedMessage = inMemoryChatRepository.messages.find(
      (item) => item.type === MessageType.AI,
    );

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toEqual({
      message: expect.objectContaining({
        content: aiSavedMessage?.content,
      }),
    });
  });
});
