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
  DATABASE_PORT: z.string().default('postgres'),
  COOKIE_SECRET: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string().default('15'),
  JAEGER_URL: z.string().default('http://localhost:4318/v1/traces'),
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_PASSWORD: z.string().optional().default('redis'),
  PORT: z.coerce.number().optional().default(3333),
  MAIL_HOST: z.string(),
  MAIL_SECURE: z.string(),
  MAIL_PORT: z.coerce.number(),
  MAIL_USER: z.string(),
  MAIL_USER_EMAIL: z.string(),
  MAIL_PASSWORD: z.string(),
  MAIL_IGNORE_TLS: z.string().transform((value) => value === 'true'),
  OPENAI_API_KEY: z.string(),
  SENTRY_DSN: z.string(),
  CONTACT_EMAIL: z.string().default('contato@medchatai.com'),
});

export type Env = z.infer<typeof envSchema>;
