import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo người dùng mới
   * Nếu email đã tồn tại trong CSDL, Prisma sẽ ném lỗi P2002 (Unique constraint failed)
   * PrismaClientExceptionFilter sẽ tự động bắt và trả về HTTP 409 Conflict.
   */
  async createUser(data: { email: string; name?: string; password?: string }) {
    return await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name || 'Test User',
        password: data.password || '123456',
      },
    });
  }

  async getUsers() {
    return await this.prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
  }
}
