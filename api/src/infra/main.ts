import './instrumentation';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { EnvService } from './env/env.service';
import { Logger } from 'nestjs-pino';
import fastifyCookie from '@fastify/cookie';
import { Env } from './env/env';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './http/filter/exceptions.filter';
import * as Sentry from '@sentry/nestjs';

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
  const sentryDsn = envService.get('SENTRY_DSN');
  const nodeEnv = envService.get('NODE_ENV');

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('med-chat-ai-api')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.register(fastifyCookie, {
    secret: cookieSecret,
    parseOptions: {},
  });

  app.enableCors({
    origin: ['*'],
    methods: ['*'],
  });

  app.useLogger(app.get(Logger));

  Sentry.init({
    dsn: sentryDsn,
    environment: nodeEnv,
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
  });

  await app.listen(port, '0.0.0.0').then(() => {
    console.log(`[MedChatAI - API] HTTP server running on port: ${port}!`);
  });
}

bootstrap();
