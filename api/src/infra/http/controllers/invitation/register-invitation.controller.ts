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
import { WrongCredentialsError } from 'src/domain/chat/application/use-cases/@errors/wrong-credentials';
import { ResourceAlreadyExists } from 'src/domain/chat/application/use-cases/@errors/resource-already-exists.error';
import { ResourceNotFoundError } from 'src/domain/chat/application/use-cases/@errors/resource-not-found.error';
import { RegisterInvitationUseCase } from 'src/domain/chat/application/use-cases/invitation/register-invitation';
import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { Roles } from 'src/infra/auth/decorators/role.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const RegisterInvitationBodySchema = z.object({
  email: z.string(),
});

type RegisterInvitationBodySchema = z.infer<
  typeof RegisterInvitationBodySchema
>;
const bodyValidationPipe = new ZodValidationPipe(RegisterInvitationBodySchema);

@ApiTags('invitation')
@Controller('/invitation')
export class RegisterInvitationController {
  constructor(private registerInvitation: RegisterInvitationUseCase) {}

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Register an invitation',
    description: 'Permite que um admin convide um usuário para a plataforma',
  })
  @ApiBody({
    description: 'Email do usuário a ser convidado',
    schema: {
      example: { email: 'user@example.com' },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Convite registrado com sucesso',
    schema: { example: { message: 'Invitation sent successfully' } },
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
    description: 'Email já foi convidado',
    schema: { example: { message: 'Resource already exists' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de requisição',
    schema: { example: { message: 'Bad request' } },
  })
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
          return new ForbiddenException(error.message);
        case ResourceAlreadyExists:
          return new ConflictException(error.message);
        case ResourceNotFoundError:
          return new NotFoundException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    return {
      message: 'Invitation sent successfully',
    };
  }
}
