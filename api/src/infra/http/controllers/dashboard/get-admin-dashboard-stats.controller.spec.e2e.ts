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
import { CompanyFactory } from 'test/factories/make-company';
import { setupFastifyTestApp } from 'test/setup-fastify-e2e';
import { RawServerDefault } from 'fastify';
import { ChatFactory } from 'test/factories/make-chat';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/domain/chat/entities/user';
import { MessageFactory } from 'test/factories/make-message';
import { MessageType } from 'src/domain/chat/entities/message';

describe('Get admin dashboard stats (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let companyFactory: CompanyFactory;
  let chatFactory: ChatFactory;
  let messageFactory: MessageFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CompanyFactory, ChatFactory, MessageFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupFastifyTestApp(
      app as unknown as NestFastifyApplication<RawServerDefault>,
    );

    userFactory = moduleRef.get(UserFactory);
    companyFactory = moduleRef.get(CompanyFactory);
    chatFactory = moduleRef.get(ChatFactory);
    messageFactory = moduleRef.get(MessageFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /dashboard', async () => {
    const company = await companyFactory.makePrismaCompany({
      name: 'Company',
    });

    const user = await userFactory.makePrismaUser({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: await hash('123456', 8),
      role: Role.ADMIN,
      companyId: company.id,
    });

    const regularUser = await userFactory.makePrismaUser({
      role: Role.USER,
      email: 'user@email.com',
      companyId: company.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      companyId: company.id.toString(),
      role: user.role,
    });

    const [chat1, chat2] = await Promise.all([
      chatFactory.makePrismaChat({
        userId: user.id,
        companyId: company.id,
      }),
      chatFactory.makePrismaChat({
        userId: regularUser.id,
        companyId: company.id,
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
