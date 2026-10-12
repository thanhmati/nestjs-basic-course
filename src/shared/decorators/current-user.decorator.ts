import { AuthenticatedSocket } from '@/auth/guards/ws-jwt.guard';
import { UserData } from '@/auth/interfaces/jwt.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: keyof UserData, context: ExecutionContext) => {
    let user: UserData | undefined;

    switch (true) {
      case context.getType() === 'http':
        {
          const request = context.switchToHttp().getRequest<Request>();
          user = request['user'] as UserData;
        }
        break;
      case context.getType() === 'ws':
        {
          const client = context.switchToWs().getClient<AuthenticatedSocket>();
          user = client.data?.user;
        }
        break;
      default:
        return null;
    }

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
