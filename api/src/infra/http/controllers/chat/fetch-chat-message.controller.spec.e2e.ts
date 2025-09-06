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
import { MessageFactory } from 'test/factories/make-message';
import { JwtService } from '@nestjs/jwt';

describe('Fetch chat messages (E2E)', () => {
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

  test('[GET] /chat/:chatId/message', async () => {
    const company = await companyFactory.makePrismaCompany({
      name: 'Company',
    });

    const user = await userFactory.makePrismaUser({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: await hash('123456', 8),
      companyId: company.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      companyId: company.id.toString(),
      role: user.role,
    });

    const chat = await chatFactory.makePrismaChat({
      userId: user.id,
      companyId: user.companyId,
    });

    await Promise.all([
      messageFactory.makePrismaMessage({
        chatId: chat.id,
      }),
      messageFactory.makePrismaMessage({
        chatId: chat.id,
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/chat/${chat.id}/message`)
      .set('Cookie', [`Authentication=${accessToken}`])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      chatId: expect.any(String),
      messages: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          chatId: expect.any(String),
          content: expect.any(String),
          type: expect.any(String),
          createdAt: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(String),
          chatId: expect.any(String),
          content: expect.any(String),
          type: expect.any(String),
          createdAt: expect.any(String),
        }),
      ]),
      meta: expect.objectContaining({
        pageIndex: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        totalPages: expect.any(Number),
      }),
    });
  });
});
