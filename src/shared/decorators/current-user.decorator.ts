import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserData } from '@/auth/interfaces/jwt.interface';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: keyof UserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request['user'] as UserData;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
