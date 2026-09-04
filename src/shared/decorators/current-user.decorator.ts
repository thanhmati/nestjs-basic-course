import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserData } from '../interfaces/auth.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof UserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Express.Request>();
    const user = request.user as UserData;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
