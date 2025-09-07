import { expect } from 'vitest';
import { InMemoryChatRepository } from 'test/repositories/in-memory-chat.repository';
import { makeUser } from 'test/factories/make-user';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { FetchChatMessageUseCase } from './fetch-chat-messages';
import { makeChat } from 'test/factories/make-chat';
import { makeMessage } from 'test/factories/make-message';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';

let inMemoryChatRepository: InMemoryChatRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let sut: FetchChatMessageUseCase;

describe('Fetch chat messages', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryChatRepository = new InMemoryChatRepository();

    sut = new FetchChatMessageUseCase(inMemoryChatRepository);
  });

  it('should be able to fetch chat messages', async () => {
    const user = makeUser({});

    const chat = makeChat({
      companyId: user.companyId,
      userId: user.id,
    });

    inMemoryUserRepository.create(user);
    inMemoryChatRepository.create(chat);

    await Promise.all([
      inMemoryChatRepository.addMessage(
        makeMessage({
          chatId: chat.id,
        }),
      ),
      inMemoryChatRepository.addMessage(
        makeMessage({
          chatId: chat.id,
        }),
      ),
      inMemoryChatRepository.addMessage(
        makeMessage({
          chatId: chat.id,
        }),
      ),
    ]);

    const result = await sut.execute({
      chatId: chat.id.toString(),
      companyId: user.companyId.toString(),
      userId: user.id.toString(),
      pageIndex: 1,
      pageSize: 10,
    });

    if (result.isLeft()) {
      throw new Error('Failed');
    }

    expect(result.value.messages).toHaveLength(3);
  });

  it('should be able to fetch paginated messages', async () => {
    const user = makeUser({});

    const chat = makeChat({
      companyId: user.companyId,
      userId: user.id,
    });

    inMemoryUserRepository.create(user);
    inMemoryChatRepository.create(chat);

    for (let i = 1; i <= 22; i++) {
      await inMemoryChatRepository.addMessage(
        makeMessage({
          chatId: chat.id,
          content: `Message ${i}`,
        }),
      );
    }

    const result = await sut.execute({
      chatId: chat.id.toString(),
      userId: user.id.toString(),
      companyId: user.companyId.toString(),
      pageIndex: 2,
      pageSize: 20,
    });

    if (result.isLeft()) {
      throw new Error('Failed');
    }

    expect(result.value.messages).toHaveLength(2);
  });

  it('should not be able to access a chat messages of another user/company', async () => {
    const user1 = makeUser();
    const user2 = makeUser();

    const chat = makeChat({
      companyId: user1.companyId,
      userId: user1.id,
    });

    inMemoryUserRepository.create(user1);
    inMemoryUserRepository.create(user2);
    inMemoryChatRepository.create(chat);

    // Busca de um usurio, em cima do chat de outra pessoa
    const result = await sut.execute({
      chatId: chat.id.toString(),
      companyId: user2.companyId.toString(),
      userId: user2.id.toString(),
      pageIndex: 1,
      pageSize: 10,
    });

    expect(result.isLeft()).toBeTruthy();

    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
