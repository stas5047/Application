import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface NestHttpErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
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

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
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
  }
}
