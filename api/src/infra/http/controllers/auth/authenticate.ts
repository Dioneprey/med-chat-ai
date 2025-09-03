import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  ForbiddenException,
  Res,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { Public } from 'src/infra/auth/public';
import { AuthenticateUseCase } from 'src/domain/chat/application/use-cases/auth/authenticate';
import { FastifyReply } from 'fastify';
import { WrongCredentialsError } from 'src/domain/chat/application/use-cases/@errors/wrong-credentials';

const AuthenticateBodySchema = z.object({
  email: z.string(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof AuthenticateBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(AuthenticateBodySchema);

@Controller('/authenticate')
@Public()
export class AuthenticateController {
  constructor(private Authenticate: AuthenticateUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: AuthenticateBodySchema,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { email, password } = body;

    const result = await this.Authenticate.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case WrongCredentialsError:
          return new ForbiddenException(error);
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
      .send({ message: 'Login successful' });
  }
}
