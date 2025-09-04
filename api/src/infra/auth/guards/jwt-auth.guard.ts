import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../public';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    const headers = request.headers;

    if (isPublic && !headers.authorization) {
      return true;
    }

    try {
      // Se houver token, tenta autenticar o usuário
      const canActivate = (await super.canActivate(context)) as boolean;

      // Se o usuário for autenticado, o request.user será preenchido
      return canActivate;
    } catch {
      // Se a rota for pública e o token for inválido, ignora o erro e permite a requisição
      if (isPublic) {
        return true; // ignora erro em rota pública
      }
      throw new UnauthorizedException('Missing or invalid token');
    }
  }
}
