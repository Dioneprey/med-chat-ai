import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { EnvService } from './env/env.service';
import { Logger } from 'nestjs-pino';
import * as fastifyCookie from '@fastify/cookie';
import { Env } from './env/env';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn', 'log'] // reduzido no prod
          : ['error', 'warn', 'log', 'debug', 'verbose'], // completo no dev
    },
  );

  const envService = app.get<ConfigService<Env, true>>(EnvService);

  const port = envService.get('PORT');
  const cookieSecret = envService.get('COOKIE_SECRET');

  await app.register(fastifyCookie, {
    secret: cookieSecret,
    parseOptions: {},
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['*'],
    methods: ['*'],
  });

  app.useLogger(app.get(Logger));

  await app.listen(port, '0.0.0.0').then(() => {
    console.log(`[MedChatIA - API] HTTP server running on port: ${port}!`);
  });
}

bootstrap();
