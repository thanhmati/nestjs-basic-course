import { Role } from '@/generated/prisma/enums';
import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/metadata.constant';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
