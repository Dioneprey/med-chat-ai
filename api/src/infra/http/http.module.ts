import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { BullMqConfigModule } from '../schedules/bullmq/bullmq.module';
import { AuthenticateController } from './controllers/auth/authenticate';
import { AuthenticateUseCase } from 'src/domain/qa/application/use-cases/auth/authenticate';
import { MailModule } from '../mail/mail.module';
import { EnvModule } from '../env/env.module';
import { GetMeController } from './controllers/user/me.controller';
import { RegisterTenantController } from './controllers/user/register-tenant-user.controller';
import { RegisterUserController } from './controllers/user/register-user.controller';
import { RegisterTenantUserUseCase } from 'src/domain/qa/application/use-cases/user/register-tenant-user';
import { RegisterUserUseCase } from 'src/domain/qa/application/use-cases/user/register-user';
import { GetCompanyByNameController } from './controllers/company/get-company-by-name.controller';
import { GetCompanyByNameUseCase } from 'src/domain/qa/application/use-cases/company/get-company-by-name';
import { RegisterInvitationController } from './controllers/Invitation/register-invitation.controller';
import { RegisterInvitationUseCase } from 'src/domain/qa/application/use-cases/invitation/register-invitation';
import { RevokeInvitationController } from './controllers/Invitation/revoke-invitation.controller';
import { RevokeInvitationUseCase } from 'src/domain/qa/application/use-cases/invitation/revoke-invitation';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    CryptographyModule,
    BullMqConfigModule,
    MailModule,
    EnvModule,
  ],
  controllers: [
    HealthController,

    // Company
    GetCompanyByNameController,

    // User
    GetMeController,
    AuthenticateController,
    RegisterTenantController,
    RegisterUserController,

    // Invitation
    RegisterInvitationController,
    RevokeInvitationController,
  ],
  providers: [
    // Company
    GetCompanyByNameUseCase,

    // User
    AuthenticateUseCase,
    RegisterTenantUserUseCase,
    RegisterUserUseCase,

    // Invitation
    RegisterInvitationUseCase,
    RevokeInvitationUseCase,
  ],
  exports: [],
})
export class HttpModule {}
