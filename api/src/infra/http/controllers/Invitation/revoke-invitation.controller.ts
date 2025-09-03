import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
  Delete,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { WrongCredentialsError } from 'src/domain/qa/application/use-cases/@errors/wrong-credentials';
import { ResourceAlreadyExists } from 'src/domain/qa/application/use-cases/@errors/resource-already-exists.error';
import { ResourceNotFoundError } from 'src/domain/qa/application/use-cases/@errors/resource-not-found.error';
import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { RevokeInvitationUseCase } from 'src/domain/qa/application/use-cases/invitation/revoke-invitation';
import { Roles } from 'src/infra/auth/decorators/role.decorator';

const RevokeInvitationBodySchema = z.object({
  email: z.string(),
});

type RevokeInvitationBodySchema = z.infer<typeof RevokeInvitationBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(RevokeInvitationBodySchema);

@Controller('/invitation')
export class RevokeInvitationController {
  constructor(private revokeInvitation: RevokeInvitationUseCase) {}

  @Delete()
  @HttpCode(200)
  @Roles('ADMIN')
  async handle(
    @Body(bodyValidationPipe) body: RevokeInvitationBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { email } = body;

    const result = await this.revokeInvitation.execute({
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
