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
import { CompanyFactory } from 'test/factories/make-company';
import { InvitationFactory } from 'test/factories/make-invitation';
import { randomUUID } from 'node:crypto';

describe('Register user (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let companyFactory: CompanyFactory;
  let invitationFactory: InvitationFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CompanyFactory, InvitationFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupFastifyTestApp(
      app as unknown as NestFastifyApplication<RawServerDefault>,
    );

    userFactory = moduleRef.get(UserFactory);
    companyFactory = moduleRef.get(CompanyFactory);
    invitationFactory = moduleRef.get(InvitationFactory);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /user', async () => {
    const company = await companyFactory.makePrismaCompany({
      name: `Empresa ${randomUUID()}`,
    });
    const invitedEmail = `${randomUUID()}@email.com`;

    const invitation = await invitationFactory.makePrismaInvitation({
      invitedEmail: invitedEmail,
      companyId: company.id,
    });

    const response = await request(app.getHttpServer()).post('/user').send({
      email: invitedEmail,
      password: '123456',
      invitationCode: invitation.code,
      name: 'user',
    });
    console.log(response);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toEqual('Registration successful');
  });
});
