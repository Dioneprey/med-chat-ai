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
import { RegisterUserUseCase } from 'src/domain/qa/application/use-cases/user/register-user';
import { ResourceAlreadyExists } from 'src/domain/qa/application/use-cases/@errors/resource-already-exists.error';
import { ResourceNotFoundError } from 'src/domain/qa/application/use-cases/@errors/resource-not-found.error';

const RegisterUserBodySchema = z.object({
  email: z.string(),
  password: z.string(),
  invitationCode: z.string(),
  name: z.string(),
});

type RegisterUserBodySchema = z.infer<typeof RegisterUserBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(RegisterUserBodySchema);

@Controller('/user')
@Public()
export class RegisterUserController {
  constructor(private RegisterUser: RegisterUserUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: RegisterUserBodySchema,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { email, password, invitationCode, name } = body;

    const result = await this.RegisterUser.execute({
      email,
      password,
      invitationCode,
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
