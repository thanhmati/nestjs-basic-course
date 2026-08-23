import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHello(): Promise<string> {
    const userCount = await this.prismaService.user.count();
    return `Xin chào! Social Chat App có tổng cộng ${userCount} người dùng trong CSDL.`;
  }
}
