import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { Redis } from 'ioredis';
import { envSchema } from 'src/infra/env/env';
import { PrismaClient } from '@generated/index';

const env = envSchema.parse(process.env);

let prisma: PrismaClient;

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
  const schemaId = randomUUID();
  const databaseUrl = generateUniqueDatabaseURL(schemaId);

  const tempPrisma = new PrismaClient({
    datasources: { db: { url: env.DATABASE_URL } }, // Use base DATABASE_URL without schema
  });

  await tempPrisma.$executeRawUnsafe(
    `CREATE SCHEMA IF NOT EXISTS "${schemaId}"`,
  );

  await tempPrisma.$disconnect();

  process.env.DATABASE_URL = databaseUrl;

  execSync(`pnpm prisma db push --accept-data-loss`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  await redis.flushdb();
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});
