import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  Res,
  ConflictException,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { Public } from 'src/infra/auth/public';
import { FastifyReply } from 'fastify';
import { ResourceAlreadyExists } from 'src/domain/chat/application/use-cases/@errors/resource-already-exists.error';
import { RegisterTenantUserUseCase } from 'src/domain/chat/application/use-cases/user/register-tenant-user';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const RegisterTenantBodySchema = z.object({
  email: z.string(),
  password: z.string(),
  companyName: z.string(),
  name: z.string(),
});

type RegisterTenantBodySchema = z.infer<typeof RegisterTenantBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(RegisterTenantBodySchema);

@ApiTags('tenant')
@Controller('/user/tenant')
@Public()
export class RegisterTenantController {
  constructor(private registerTenant: RegisterTenantUserUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a new tenant',
    description: 'Registra um novo tenant e cria o usuário administrador',
  })
  @ApiBody({
    description: 'Dados para registro do tenant e do usuário administrador',
    schema: {
      example: {
        email: 'admin@example.com',
        password: 'senha123',
        companyName: 'Minha Empresa',
        name: 'Administrador',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registro realizado com sucesso',
    schema: { example: { message: 'Registration successful' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Recurso já existe',
    schema: { example: { message: 'Resource already exists' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de requisição',
    schema: { example: { message: 'Bad request' } },
  })
  async handle(
    @Body(bodyValidationPipe) body: RegisterTenantBodySchema,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { email, password, companyName, name } = body;

    const result = await this.registerTenant.execute({
      email,
      password,
      companyName,
      name,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceAlreadyExists:
          return new ConflictException(error.message);
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
