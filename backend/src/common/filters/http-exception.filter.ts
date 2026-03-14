import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface NestHttpErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

interface QueryFailedErrorWithCode extends QueryFailedError {
  code?: string;
}

function isNestErrorResponse(value: unknown): value is NestHttpErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    (typeof (value as NestHttpErrorResponse).message === 'string' ||
      Array.isArray((value as NestHttpErrorResponse).message))
  );
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string | string[];
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (isNestErrorResponse(exceptionResponse)) {
        message = exceptionResponse.message;
      } else {
        message = exception.message;
      }

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
      return;
    }

    if (exception instanceof QueryFailedError) {
      const code = (exception as QueryFailedErrorWithCode).code;
      if (code === '23505') {
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: 'Resource already exists',
        });
        return;
      }
      this.logger.error(
        `Database error on ${request.method} ${request.url}: ${exception.message}`,
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Internal server error',
      });
      return;
    }

    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}: ${
        exception instanceof Error ? exception.message : String(exception)
      }`,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error',
    });
  }
}
