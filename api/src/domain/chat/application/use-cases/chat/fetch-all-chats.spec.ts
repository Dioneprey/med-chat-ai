import { expect } from 'vitest';
import { InMemoryChatRepository } from 'test/repositories/in-memory-chat.repository';
import { makeUser } from 'test/factories/make-user';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { makeChat } from 'test/factories/make-chat';
import { FetchAllChatsUseCaseUseCase } from './fetch-all-chats';

let inMemoryChatRepository: InMemoryChatRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let sut: FetchAllChatsUseCaseUseCase;

describe('Fetch all chats', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryChatRepository = new InMemoryChatRepository();

    sut = new FetchAllChatsUseCaseUseCase(inMemoryChatRepository);
  });

  it('should be able to fetch user chats', async () => {
    const user = makeUser({});

    inMemoryUserRepository.create(user);

    await Promise.all([
      inMemoryChatRepository.create(
        makeChat({
          companyId: user.companyId,
          userId: user.id,
        }),
      ),
      inMemoryChatRepository.create(
        makeChat({
          companyId: user.companyId,
          userId: user.id,
        }),
      ),
    ]);

    const result = await sut.execute({
      userId: user.id.toString(),
      companyId: user.companyId.toString(),
      pageIndex: 1,
      pageSize: 10,
    });

    if (result.isLeft()) {
      throw new Error('Failed');
    }

    expect(result.value.totalCount).toEqual(2);
  });

  it('should be able to fetch paginated chats', async () => {
    const user = makeUser({});

    inMemoryUserRepository.create(user);

    for (let i = 1; i <= 22; i++) {
      await inMemoryChatRepository.create(
        makeChat({
          companyId: user.companyId,
          userId: user.id,
        }),
      );
    }

    const result = await sut.execute({
      userId: user.id.toString(),
      companyId: user.companyId.toString(),
      pageIndex: 2,
      pageSize: 20,
    });

    if (result.isLeft()) {
      throw new Error('Failed');
    }

    expect(result.value.chats).toHaveLength(2);
  });

  it('should not be able to access a chat of another user/company', async () => {
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
      companyId: user2.companyId.toString(),
      userId: user2.id.toString(),
      pageIndex: 1,
      pageSize: 10,
    });

    if (result.isLeft()) {
      throw new Error('Failed');
    }

    expect(result.value.chats).toHaveLength(0);
  });
});
