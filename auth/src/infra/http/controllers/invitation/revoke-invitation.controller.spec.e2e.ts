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
import { Role } from 'src/domain/auth/entities/user';
import { InvitationFactory } from 'test/factories/make-invitation';

describe('Revoke invitation (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let companyFactory: CompanyFactory;
  let invitationFactory: InvitationFactory;

  let jwt: JwtService;

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
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[DELETE] /invitation', async () => {
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

    const invitedEmail = 'revoked@email.com';

    await invitationFactory.makePrismaInvitation({
      invitedEmail: invitedEmail,
      companyId: company.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      companyId: company.id.toString(),
      role: user.role,
    });

    const response = await request(app.getHttpServer())
      .delete(`/invitation`)
      .set('Cookie', [`Authentication=${accessToken}`])
      .send({
        email: invitedEmail,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual('Invitation revoked successfully');
  });
});
