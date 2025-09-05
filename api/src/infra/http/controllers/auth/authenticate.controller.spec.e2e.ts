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

describe('Authenticate (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let companyFactory: CompanyFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CompanyFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    userFactory = moduleRef.get(UserFactory);
    companyFactory = moduleRef.get(CompanyFactory);

    await app.init();
  });

  test('[POST] /auth', async () => {
    console.log('aq');

    // const company = await companyFactory.makePrismaCompany({
    //   name: 'Company',
    // });
    // await userFactory.makePrismaUser({
    //   name: 'John Doe',
    //   email: 'john.doe@gmail.com',
    //   password: await hash('123456', 8),
    //   companyId: company.id,
    // });

    // const response = await request(app.getHttpServer()).post('/auth').send({
    //   email: 'john.doe@gmail.com',
    //   password: '123456',
    // });

    // expect(response.statusCode).toBe(201);
    // expect(response.body).toEqual({
    //   access_token: expect.any(String),
    // });
  });
});
