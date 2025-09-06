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

describe('Fetch all chats (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let companyFactory: CompanyFactory;
  let chatFactory: ChatFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CompanyFactory, ChatFactory],
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
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /chat', async () => {
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

    await Promise.all([
      chatFactory.makePrismaChat({
        userId: user.id,
        companyId: user.companyId,
      }),
      chatFactory.makePrismaChat({
        userId: user.id,
        companyId: user.companyId,
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get('/chat')
      .set('Cookie', [`Authentication=${accessToken}`])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      chats: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          userId: expect.any(String),
          companyId: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(String),
          userId: expect.any(String),
          companyId: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
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
