import { Role } from '@/generated/prisma/enums';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

export interface UserData {
  userId: number;
  email: string;
}
