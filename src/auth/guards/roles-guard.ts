import { Role } from '@/generated/prisma/enums';
import { ROLES_KEY } from '@/shared/constants/metadata.constant';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserData } from '../interfaces/jwt.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: UserData }>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào tài nguyên này!',
      );
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào tài nguyên này!',
      );
    }

    return true;
  }
}
