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
import { WrongCredentialsError } from 'src/domain/chat/application/use-cases/@errors/wrong-credentials';
import { ResourceAlreadyExists } from 'src/domain/chat/application/use-cases/@errors/resource-already-exists.error';
import { ResourceNotFoundError } from 'src/domain/chat/application/use-cases/@errors/resource-not-found.error';
import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { RevokeInvitationUseCase } from 'src/domain/chat/application/use-cases/invitation/revoke-invitation';
import { Roles } from 'src/infra/auth/decorators/role.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const RevokeInvitationBodySchema = z.object({
  email: z.string(),
});

type RevokeInvitationBodySchema = z.infer<typeof RevokeInvitationBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(RevokeInvitationBodySchema);

@ApiTags('invitation')
@Controller('/invitation')
export class RevokeInvitationController {
  constructor(private revokeInvitation: RevokeInvitationUseCase) {}

  @Delete()
  @HttpCode(200)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Revoke an invitation',
    description:
      'Permite que um admin revogue um convite já enviado a um usuário',
  })
  @ApiBody({
    description: 'Email do usuário cujo convite será revogado',
    schema: {
      example: { email: 'user@example.com' },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Convite revogado com sucesso',
    schema: { example: { message: 'Invitation revoked successfully' } },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - usuário sem permissão',
    schema: { example: { message: 'Forbidden' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso não encontrado',
    schema: { example: { message: 'Resource not found' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Erro de conflito',
    schema: { example: { message: 'Resource already exists' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de requisição',
    schema: { example: { message: 'Bad request' } },
  })
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
          return new ForbiddenException(error.message);
        case ResourceAlreadyExists:
          return new ConflictException(error.message);
        case ResourceNotFoundError:
          return new NotFoundException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    return { message: 'Invitation revoked successfully' };
  }
}
