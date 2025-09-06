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
import { JwtService } from '@nestjs/jwt';

describe('Send chat message (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let companyFactory: CompanyFactory;

  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CompanyFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupFastifyTestApp(
      app as unknown as NestFastifyApplication<RawServerDefault>,
    );

    userFactory = moduleRef.get(UserFactory);
    companyFactory = moduleRef.get(CompanyFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /chat/message', async () => {
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

    const response = await request(app.getHttpServer())
      .post(`/chat/message`)
      .set('Cookie', [`Authentication=${accessToken}`])
      .send({
        message: 'Olá, quantos é 1 + 5?',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: expect.objectContaining({
        id: expect.any(String),
        chatId: expect.any(String),
        content: expect.any(String),
        type: expect.any(String),
        createdAt: expect.any(String),
      }),
    });
  });
});
