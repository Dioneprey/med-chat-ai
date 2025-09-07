import {
  Controller,
  Post,
  HttpCode,
  BadRequestException,
  ForbiddenException,
  Res,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';

import { Public } from 'src/infra/auth/public';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnvService } from 'src/infra/env/env.service';
import { RefreshTokenUseCase } from 'src/domain/auth/application/use-cases/auth/refresh-token';
import { ResourceInvalidError } from 'src/domain/auth/application/use-cases/@errors/resource-invalid.error';
import { ResourceNotFoundError } from 'src/domain/auth/application/use-cases/@errors/resource-not-found.error';

@ApiTags('auth')
@Controller('/auth/refresh')
@Public()
export class RefreshTokenController {
  constructor(
    private refreshToken: RefreshTokenUseCase,
    private envService: EnvService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Atualiza o token de acesso',
    description:
      'Renova o access token usando o refresh token armazenado nos cookies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token atualizado com sucesso',
    schema: { example: { message: 'Refresh token successful' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token não encontrado ou inválido',
    schema: { example: { message: 'Refresh token not found' } },
  })
  async handle(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const refreshToken = request.cookies['RefreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.refreshToken.execute({
      refreshToken,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceInvalidError:
          return new ForbiddenException(error.message);
        case ResourceNotFoundError:
          return new NotFoundException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const { accessToken, refreshToken: newRefreshToken } = result.value;

    reply
      .setCookie('Authentication', accessToken, {
        httpOnly: true,
        secure: this.envService.get('SECURE_COOKIE'),
        path: '/',
        sameSite: 'lax',
        maxAge: Number(this.envService.get('JWT_EXPIRATION')) * 60, // 15 minutos
      })
      .setCookie('RefreshToken', newRefreshToken, {
        httpOnly: true,
        secure: this.envService.get('SECURE_COOKIE'),
        path: '/',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 dias
      })
      .send({ message: 'Refresh token successful' });
  }
}
