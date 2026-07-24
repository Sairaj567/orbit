import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      data: null,
      errors: this.extractErrors(exceptionResponse),
      meta: {
        timestamp: new Date().toISOString(),
        statusCode: status,
      },
    };

    if (status >= 500) {
      this.logger.error(`HTTP ${status}: ${JSON.stringify(errorResponse.errors)}`);
    }

    response.status(status).json(errorResponse);
  }

  private extractErrors(
    response: string | object,
  ): Array<{ code: string; message: string; field?: string }> {
    if (typeof response === 'string') {
      return [{ code: 'ERROR', message: response }];
    }

    const res = response as Record<string, unknown>;

    // Handle class-validator errors
    if (Array.isArray(res.message)) {
      return (res.message as string[]).map((msg) => ({
        code: 'VALIDATION_ERROR',
        message: msg,
      }));
    }

    return [
      {
        code: (res.error as string) || 'ERROR',
        message: (res.message as string) || 'An error occurred',
      },
    ];
  }
}
