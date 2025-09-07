import '@fastify/cookie';
import { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    cookies: {
      [cookieName: string]: string;
    };
  }
  interface FastifyReply {
    cookies: {
      [cookieName: string]: string;
    };

    setCookie(
      name: string,
      value: string,
      options?: {
        domain?: string;
        path?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: 'lax' | 'strict' | 'none';
        maxAge?: number;
        expires?: Date;
      },
    ): this;

    clearCookie(
      name: string,
      options?: {
        domain?: string;
        path?: string;
      },
    ): this;
  }
}
