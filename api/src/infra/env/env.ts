import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
  DATABASE_URL: z.string(),
  DATABASE_USER: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_NAME: z.string().default('postgres'),
  DATABASE_PORT: z.number().default(5455),
  COOKIE_SECRET: z.string().default('supersecretmedchat'),
  JWT_SECRET: z.string().default('supersecretmedchat'),
  KONG_URL: z.string().default('http://localhost:8000'),
  SECURE_COOKIE: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  JWT_EXPIRATION: z.string().default('15'),
  JAEGER_URL: z.string().default('http://localhost:4318/v1/traces'),
  KAFKA_URL: z.string().default('localhost:9092'),
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_PASSWORD: z.string().optional().default('redis'),
  PORT: z.coerce.number().optional().default(3333),
  OPENAI_API_KEY: z.string(),
  SENTRY_DSN: z.string().optional(),
  CONTACT_EMAIL: z.string().default('contato@medchatai.com'),
});

export type Env = z.infer<typeof envSchema>;
