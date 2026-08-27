import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');
  private readonly SLOW_REQUEST_THRESHOLD_MS = 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, url } = request;
    const targetUrl = originalUrl || url;

    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const logMessage = `[${className}#${handlerName}] ${method} ${targetUrl} +${duration}ms`;

          if (duration >= this.SLOW_REQUEST_THRESHOLD_MS) {
            this.logger.warn(`[SLOW API] ${logMessage}`);
          } else {
            this.logger.log(logMessage);
          }
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${className}#${handlerName}] ${method} ${targetUrl} +${duration}ms [FAILED: ${error.message}]`,
          );
        },
      }),
    );
  }
}
