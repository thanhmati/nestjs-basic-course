import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';
import { UserData } from '../interfaces/jwt.interface';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/shared/constants/metadata.constant';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: UserData;
    [key: string]: unknown;
  };
}

@Injectable()
export class WsJwtGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || context.getType() !== 'ws') {
      return true;
    }

    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>();
    const auth = client.handshake?.auth as Record<string, unknown> | undefined;
    const rawToken = typeof auth?.token === 'string' ? auth.token : undefined;

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

    if (client.data.user?.userId) {
      void client.join(`user:${client.data.user.userId}`);
    }

    return user;
  }
}
