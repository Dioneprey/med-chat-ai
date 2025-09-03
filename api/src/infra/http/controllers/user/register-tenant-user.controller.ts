import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  ForbiddenException,
  Res,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { Public } from 'src/infra/auth/public';
import { FastifyReply } from 'fastify';
import { WrongCredentialsError } from 'src/domain/qa/application/use-cases/@errors/wrong-credentials';
import { ResourceAlreadyExists } from 'src/domain/qa/application/use-cases/@errors/resource-already-exists.error';
import { ResourceNotFoundError } from 'src/domain/qa/application/use-cases/@errors/resource-not-found.error';
import { RegisterTenantUserUseCase } from 'src/domain/qa/application/use-cases/user/register-tenant-user';

const RegisterTenantBodySchema = z.object({
  email: z.string(),
  password: z.string(),
  companyName: z.string(),
  name: z.string(),
});

type RegisterTenantBodySchema = z.infer<typeof RegisterTenantBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(RegisterTenantBodySchema);

@Controller('/user/tenant')
@Public()
export class RegisterTenantController {
  constructor(private RegisterTenant: RegisterTenantUserUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: RegisterTenantBodySchema,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { email, password, companyName, name } = body;

    const result = await this.RegisterTenant.execute({
      email,
      password,
      companyName,
      name,
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
