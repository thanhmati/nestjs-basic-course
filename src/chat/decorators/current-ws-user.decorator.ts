import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedSocket } from '@/auth/guards/ws-jwt.guard';
import type { UserData } from '@/auth/interfaces/jwt.interface';

export const CurrentWsUser = createParamDecorator(
  (data: keyof UserData | undefined, context: ExecutionContext) => {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const user = client.data?.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
