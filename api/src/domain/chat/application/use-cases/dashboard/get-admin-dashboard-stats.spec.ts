import { GetAdminDashboardStatsUseCase } from './get-admin-dashboard-stats';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryChatRepository } from 'test/repositories/in-memory-chat.repository';
import { makeUser } from 'test/factories/make-user';
import { Role } from 'src/domain/chat/entities/user';
import { makeChat } from 'test/factories/make-chat';
import { makeMessage } from 'test/factories/make-message';
import { MessageType } from 'src/domain/chat/entities/message';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { randomUUID } from 'crypto';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryChatRepository: InMemoryChatRepository;

let sut: GetAdminDashboardStatsUseCase;

describe('Get admin dashboard stats', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryChatRepository = new InMemoryChatRepository();

    sut = new GetAdminDashboardStatsUseCase(
      inMemoryUserRepository,
      inMemoryChatRepository,
    );
  });

  it('should be able to get admin dashboard stats', async () => {
    const companyId = new UniqueEntityID(randomUUID());

    const adminUser = makeUser({
      role: Role.ADMIN,
      companyId: companyId,
    });
    const regularUser = makeUser({
      role: Role.USER,
      companyId: companyId,
    });

    await inMemoryUserRepository.create(adminUser);
    await inMemoryUserRepository.create(regularUser);

    const chat1 = makeChat({
      userId: adminUser.id,
      companyId: adminUser.companyId,
    });
    const chat2 = makeChat({
      userId: regularUser.id,
      companyId: regularUser.companyId,
    });

    await inMemoryChatRepository.create(chat1);
    await inMemoryChatRepository.create(chat2);

    await inMemoryChatRepository.addMessage(
      makeMessage({
        chatId: chat1.id,
        type: MessageType.USER,
        content: 'Message 1',
      }),
    );

    await inMemoryChatRepository.addMessage(
      makeMessage({
        chatId: chat2.id,
        type: MessageType.USER,
        content: 'Message 2',
      }),
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const result = await sut.execute({
      userId: adminUser.id.toString(),
      companyId: adminUser.companyId.toString(),
      from: yesterday,
      to: tomorrow,
    });

    if (result.isLeft()) {
      throw new Error(`Failed`);
    }

    expect(result.value).toEqual(
      expect.objectContaining({
        totalUsersQuestions: 2,
        totalUsersInPeriod: 2,
        totalUsers: 2,
        topUsersByQuestions: expect.any(Array),
        questionsByDay: expect.any(Array),
      }),
    );

    expect(result.value.topUsersByQuestions).toHaveLength(2);
  });
});
