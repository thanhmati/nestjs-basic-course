import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Reflector } from '@nestjs/core';
import {
  BYPASS_TRANSFORM_KEY,
  RESPONSE_MESSAGE_KEY,
} from '../constants/metadata.constant';
import { Request, Response } from 'express';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | T> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const isByPass = this.reflector.getAllAndOverride<boolean>(
      BYPASS_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isByPass) {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const customMesssage =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || 'Thao tác thực hiện thành công';

    return next.handle().pipe(
      map((data: T): ApiResponse<T> => {
        return {
          statusCode: response.statusCode,
          data,
          message: customMesssage,
          path: request.originalUrl || request.url,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
