import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { WrongCredentialsError } from 'src/domain/qa/application/use-cases/@errors/wrong-credentials';
import { ResourceAlreadyExists } from 'src/domain/qa/application/use-cases/@errors/resource-already-exists.error';
import { ResourceNotFoundError } from 'src/domain/qa/application/use-cases/@errors/resource-not-found.error';
import { RegisterInvitationUseCase } from 'src/domain/qa/application/use-cases/invitation/register-invitation';
import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { Roles } from 'src/infra/auth/decorators/role.decorator';

const RegisterInvitationBodySchema = z.object({
  email: z.string(),
});

type RegisterInvitationBodySchema = z.infer<
  typeof RegisterInvitationBodySchema
>;
const bodyValidationPipe = new ZodValidationPipe(RegisterInvitationBodySchema);

@Controller('/invitation')
export class RegisterInvitationController {
  constructor(private registerInvitation: RegisterInvitationUseCase) {}

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async handle(
    @Body(bodyValidationPipe) body: RegisterInvitationBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { email } = body;

    const result = await this.registerInvitation.execute({
      invitedEmail: email,
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case WrongCredentialsError:
          return new ForbiddenException(error);
        case ResourceAlreadyExists:
          return new ConflictException(error);
        case ResourceNotFoundError:
          return new NotFoundException(error);
        default:
          return new BadRequestException(error.message);
      }
    }
  }
}
