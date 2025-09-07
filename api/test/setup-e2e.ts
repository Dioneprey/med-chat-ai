import { config } from 'dotenv';

import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { Redis } from 'ioredis';
import { envSchema } from 'src/infra/env/env';
import { PrismaClient } from '@generated/index';

const env = envSchema.parse(process.env);

const prisma = new PrismaClient();

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: 5,
});

function generateUniqueDatabaseURL(schemaId: string) {
  if (!env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable.');
  }

  const url = new URL(env.DATABASE_URL);

  url.searchParams.set('schema', schemaId);

  return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
  const databaseUrl = generateUniqueDatabaseURL(schemaId);

  env.DATABASE_URL = databaseUrl;

  await redis.flushdb();

  execSync(`prisma db push --accept-data-loss`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});
