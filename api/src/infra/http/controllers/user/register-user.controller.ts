import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  Res,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { Public } from 'src/infra/auth/public';
import { FastifyReply } from 'fastify';
import { RegisterUserUseCase } from 'src/domain/chat/application/use-cases/user/register-user';
import { ResourceAlreadyExists } from 'src/domain/chat/application/use-cases/@errors/resource-already-exists.error';
import { ResourceNotFoundError } from 'src/domain/chat/application/use-cases/@errors/resource-not-found.error';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const RegisterUserBodySchema = z.object({
  email: z.string(),
  password: z.string(),
  invitationCode: z.string(),
  name: z.string(),
});

type RegisterUserBodySchema = z.infer<typeof RegisterUserBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(RegisterUserBodySchema);

@ApiTags('user')
@Controller('/user')
@Public()
export class RegisterUserController {
  constructor(private registerUser: RegisterUserUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a user',
    description: 'Registra um usuário utilizando um código de convite',
  })
  @ApiBody({
    description: 'Dados para registro do usuário',
    schema: {
      example: {
        email: 'user@example.com',
        password: 'senha123',
        invitationCode: 'abc123',
        name: 'Nome do Usuário',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registro realizado com sucesso',
    schema: { example: { message: 'Registration successful' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Código de convite ou recurso não encontrado',
    schema: { example: { message: 'Resource not found' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
    schema: { example: { message: 'Resource already exists' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de requisição',
    schema: { example: { message: 'Bad request' } },
  })
  async handle(
    @Body(bodyValidationPipe) body: RegisterUserBodySchema,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { email, password, invitationCode, name } = body;

    const result = await this.registerUser.execute({
      email,
      password,
      invitationCode,
      name,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceAlreadyExists:
          return new ConflictException(error.message);
        case ResourceNotFoundError:
          return new NotFoundException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const accessToken = result.value.accessToken;

    reply
      .setCookie('Authentication', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 dias
      })
      .send({ message: 'Registration successful' });
  }
}
