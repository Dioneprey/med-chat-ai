import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
  DATABASE_URL: z.string(),
  DATABASE_USER: z.string().default('medseniorqa'),
  DATABASE_PASSWORD: z.string().default('medseniorqa'),
  DATABASE_NAME: z.string().default('medseniorqa'),
  COOKIE_SECRET: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string().default('15'),
  JAEGER_URL: z.string().default('http://localhost:4318/v1/traces'),
  FRONT_END_URL: z.string().default('FRONT_END_URL'),
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_PASSWORD: z.string().optional().default('medseniorqa'),
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
  CONTACT_EMAIL: z.string().default('contato@medseniorqa.com'),
});

export type Env = z.infer<typeof envSchema>;
