import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let status: number;
    let message: string | object;

    console.error(exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? { message: res } : res;

      // enviar só erros 500 para o sentry
      if (status >= 500) {
        Sentry.captureException(exception);
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = { message: 'Internal server error' };

      Sentry.captureException(exception);
    }

    response.status(status).send({
      statusCode: status,
      ...message,
    });
  }
}
