import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/infra/app.module';
import { hash } from 'bcryptjs';
import { DatabaseModule } from 'src/infra/database/database.module';
import { UserFactory } from 'test/factories/make-user';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { setupFastifyTestApp } from 'test/setup-fastify-e2e';
import { RawServerDefault } from 'fastify';
import { ChatFactory } from 'test/factories/make-chat';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/domain/chat/entities/user';
import { MessageFactory } from 'test/factories/make-message';
import { MessageType } from 'src/domain/chat/entities/message';
import { randomUUID } from 'crypto';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

describe('Get admin dashboard stats (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let chatFactory: ChatFactory;
  let messageFactory: MessageFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, ChatFactory, MessageFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupFastifyTestApp(
      app as unknown as NestFastifyApplication<RawServerDefault>,
    );

    userFactory = moduleRef.get(UserFactory);
    chatFactory = moduleRef.get(ChatFactory);
    messageFactory = moduleRef.get(MessageFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  test('[GET] /dashboard', async () => {
    const companyId = new UniqueEntityID(randomUUID());

    const user = await userFactory.makePrismaUser({
      name: 'John Doe',
      role: Role.ADMIN,
      companyId: companyId,
    });

    const regularUser = await userFactory.makePrismaUser({
      role: Role.USER,
      companyId: companyId,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      companyId: companyId.toString(),
      role: user.role,
    });

    const [chat1, chat2] = await Promise.all([
      chatFactory.makePrismaChat({
        userId: user.id,
        companyId: companyId,
      }),
      chatFactory.makePrismaChat({
        userId: regularUser.id,
        companyId: companyId,
      }),
    ]);

    await Promise.all([
      messageFactory.makePrismaMessage({
        chatId: chat1.id,
        type: MessageType.USER,
        content: 'Message 1',
      }),
      messageFactory.makePrismaMessage({
        chatId: chat2.id,
        type: MessageType.USER,
        content: 'Message 2',
      }),
    ]);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const response = await request(app.getHttpServer())
      .get('/dashboard')
      .set('Cookie', [`Authentication=${accessToken}`])
      .query({
        from: yesterday,
        to: tomorrow,
      })
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        totalUsersQuestions: 2,
        totalUsersInPeriod: 2,
        totalUsers: 2,
        topUsersByQuestions: expect.any(Array),
        questionsByDay: expect.any(Array),
        meta: expect.objectContaining({
          to: expect.any(String),
          from: expect.any(String),
        }),
      }),
    );
  });
});
