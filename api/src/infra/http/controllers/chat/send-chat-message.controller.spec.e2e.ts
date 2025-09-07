import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { UserFactory } from 'test/factories/make-user';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { setupFastifyTestApp } from 'test/setup-fastify-e2e';
import { RawServerDefault } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { randomUUID } from 'crypto';

describe('Send chat message (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;

  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupFastifyTestApp(
      app as unknown as NestFastifyApplication<RawServerDefault>,
    );

    userFactory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /chat/message', async () => {
    const companyId = new UniqueEntityID(randomUUID());

    const user = await userFactory.makePrismaUser({
      name: 'John Doe',
      companyId: companyId,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      companyId: companyId.toString(),
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
