import { INestApplication } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { RawServerDefault } from 'fastify';
import fastifyCookie from '@fastify/cookie';

export async function setupFastifyTestApp(
  app: NestFastifyApplication<RawServerDefault>,
): Promise<INestApplication> {
  await app.register(fastifyCookie as any, {
    secret: 'secret',
    parseOptions: {},
  });

  return app;
}
