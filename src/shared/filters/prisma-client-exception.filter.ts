import { Prisma } from '@/generated/prisma/client';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorCode = exception.code;
    const target = (exception.meta?.target as string[]) || [];

    this.logger.error(`Prisma Error Code: ${errorCode} - ${exception.message}`);

    switch (errorCode) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const fieldName = target.join(', ');
        response.status(status).json({
          statusCode: status,
          error: 'Conflict',
          message: fieldName
            ? `Bản ghi với ${fieldName} này đã tồn tại trong hệ thống.`
            : 'Dữ liệu bị trùng lặp.',
        });
        break;
      }

      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          error: 'Not Found',
          message:
            (exception.meta?.cause as string) ||
            'Không tìm thấy bản ghi yêu cầu.',
        });
        break;
      }

      case 'P2003': {
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          error: 'Bad Request',
          message: 'Lỗi ràng buộc khóa ngoại (Foreign key constraint failed).',
        });
        break;
      }

      default: {
        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
          statusCode: status,
          error: 'Internal Server Error',
          message: 'Lỗi cơ sở dữ liệu không xác định.',
        });
        break;
      }
    }
  }
}
