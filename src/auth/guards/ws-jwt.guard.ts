import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import type { UserData } from '@/auth/interfaces/jwt.interface';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: UserData;
    [key: string]: unknown;
  };
}

@Injectable()
export class WsJwtGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(WsJwtGuard.name);

  getRequest(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>();
    const auth = client.handshake?.auth as Record<string, unknown> | undefined;
    const authHeader = client.handshake?.headers?.authorization;

    const rawToken =
      (typeof auth?.token === 'string' ? auth.token : undefined) ??
      (typeof authHeader === 'string' ? authHeader : undefined);

    const token =
      rawToken && !rawToken.startsWith('Bearer ')
        ? `Bearer ${rawToken}`
        : rawToken;

    return {
      headers: {
        authorization: token,
      },
    };
  }

  handleRequest<TUser = UserData>(
    err: unknown,
    user: TUser | false | null | undefined,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const errorMessage =
        info instanceof Error
          ? info.message
          : 'Unauthorized: Bạn cần đăng nhập để thực hiện hành động này!';

      throw new WsException(errorMessage);
    }

    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    client.data.user = user as unknown as UserData;

    return user;
  }
}
