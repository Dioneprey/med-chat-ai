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
import { AuthenticateUseCase } from 'src/domain/auth/application/use-cases/auth/authenticate';
import { FastifyReply } from 'fastify';
import { WrongCredentialsError } from 'src/domain/auth/application/use-cases/@errors/wrong-credentials';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnvService } from 'src/infra/env/env.service';

const AuthenticateBodySchema = z.object({
  email: z.string(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof AuthenticateBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(AuthenticateBodySchema);

@ApiTags('auth')
@Controller('/auth')
@Public()
export class AuthenticateController {
  constructor(
    private authenticate: AuthenticateUseCase,
    private envService: EnvService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Autentica um usuário e retorna um token JWT no cookie',
  })
  @ApiBody({
    description: 'Credenciais do usuário',
    schema: {
      example: {
        email: 'user@example.com',
        password: 'senha123',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: { message: 'Login successful' },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Wrong credentials',
    schema: {
      example: { message: 'Credenciais incorretas' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: { message: 'Erro de requisição' },
    },
  })
  async handle(
    @Body(bodyValidationPipe) body: AuthenticateBodySchema,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { email, password } = body;

    const result = await this.authenticate.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case WrongCredentialsError:
          return new ForbiddenException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const { accessToken, refreshToken } = result.value;

    reply
      .setCookie('Authentication', accessToken, {
        httpOnly: true,
        secure: this.envService.get('SECURE_COOKIE'),
        path: '/',
        sameSite: 'lax',
        maxAge: Number(this.envService.get('JWT_EXPIRATION')) * 60, // 15 minutos
      })
      .setCookie('RefreshToken', refreshToken, {
        httpOnly: true,
        secure: this.envService.get('SECURE_COOKIE'),
        path: '/',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 dias
      })
      .send({ message: 'Login successful' });
  }
}
