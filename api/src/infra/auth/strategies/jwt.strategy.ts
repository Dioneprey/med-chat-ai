import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyReply } from 'fastify';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayload } from 'src/core/types/user-payload';
import { EnvService } from 'src/infra/env/env.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(envService: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (reply: FastifyReply) => reply.cookies.Authentication,
      ]),
      secretOrKey: envService.get('JWT_SECRET'),
    });
  }

  validate(payload: UserPayload) {
    return payload;
  }
}
