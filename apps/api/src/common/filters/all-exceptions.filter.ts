import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Let HttpExceptionFilter handle known HTTP exceptions
    if (exception instanceof HttpException) {
      throw exception;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    this.logger.error(
      `Unhandled exception: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const errorResponse = {
      data: null,
      errors: [
        {
          code: 'INTERNAL_SERVER_ERROR',
          message:
            process.env.NODE_ENV === 'production'
              ? 'An unexpected error occurred'
              : message,
        },
      ],
      meta: {
        timestamp: new Date().toISOString(),
        statusCode: status,
      },
    };

    response.status(status).json(errorResponse);
  }
}
