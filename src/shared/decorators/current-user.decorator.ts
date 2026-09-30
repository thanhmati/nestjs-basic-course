import { UserData } from '@/auth/interfaces/jwt.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: keyof UserData, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as UserData;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
