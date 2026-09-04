import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserData } from '../interfaces/auth.interface';
import { IS_PUBLIC_KEY } from '../constants/metadata.constant';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = UserData>(
    err: unknown,
    user: TUser | false | null | undefined,
    info: unknown,
  ): TUser {
    if (err || !user) {
      if (info instanceof Error && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!',
        );
      }

      if (info instanceof Error && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Mã xác thực (Token) không hợp lệ!');
      }

      if (err instanceof Error) {
        throw err;
      }

      throw new UnauthorizedException(
        'Bạn cần đăng nhập (gửi kèm Bearer Token) để truy cập tài nguyên này!',
      );
    }
    return user;
  }
}
