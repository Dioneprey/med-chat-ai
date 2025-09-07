import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { BullMqConfigModule } from '../schedules/bullmq/bullmq.module';
import { AuthenticateController } from './controllers/auth/authenticate.controller';
import { AuthenticateUseCase } from 'src/domain/auth/application/use-cases/auth/authenticate';
import { MailModule } from '../mail/mail.module';
import { EnvModule } from '../env/env.module';
import { GetMeController } from './controllers/user/me.controller';
import { RegisterTenantController } from './controllers/user/register-tenant-user.controller';
import { RegisterUserController } from './controllers/user/register-user.controller';
import { RegisterTenantUserUseCase } from 'src/domain/auth/application/use-cases/user/register-tenant-user';
import { RegisterUserUseCase } from 'src/domain/auth/application/use-cases/user/register-user';
import { GetCompanyByNameController } from './controllers/company/get-company-by-name.controller';
import { GetCompanyByNameUseCase } from 'src/domain/auth/application/use-cases/company/get-company-by-name';
import { RegisterInvitationController } from './controllers/invitation/register-invitation.controller';
import { RegisterInvitationUseCase } from 'src/domain/auth/application/use-cases/invitation/register-invitation';
import { RevokeInvitationController } from './controllers/invitation/revoke-invitation.controller';
import { RevokeInvitationUseCase } from 'src/domain/auth/application/use-cases/invitation/revoke-invitation';
import { RefreshTokenController } from './controllers/auth/refresh-token.controller';
import { RefreshTokenUseCase } from 'src/domain/auth/application/use-cases/auth/refresh-token';

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

    // Auth

    AuthenticateController,
    RefreshTokenController,

    // User
    GetMeController,
    RegisterTenantController,
    RegisterUserController,

    // Invitation
    RegisterInvitationController,
    RevokeInvitationController,
  ],
  providers: [
    // Company
    GetCompanyByNameUseCase,

    // Auth
    AuthenticateUseCase,
    RefreshTokenUseCase,

    // User
    RegisterTenantUserUseCase,
    RegisterUserUseCase,

    // Invitation
    RegisterInvitationUseCase,
    RevokeInvitationUseCase,
  ],
  exports: [],
})
export class HttpModule {}
