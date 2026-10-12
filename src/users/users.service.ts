import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { HashService } from '@/shared/services/hash.service';
import { deleteUploadedFile } from '@/shared/helpers/multer.helper';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  /**
   * Lấy danh sách thành viên trong hệ thống (hỗ trợ tìm kiếm và loại trừ bản thân)
   */
  async findAll(currentUserId?: number, query?: QueryUserDto) {
    const { search, limit = 50 } = query || {};

    const where: Prisma.UserWhereInput = {
      ...(currentUserId && {
        id: { not: currentUserId },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.user.findMany({
      where,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            avatarUrl: true,
            bio: true,
            location: true,
          },
        },
      },
    });
  }

  /**
   * Xem hồ sơ cá nhân đầy đủ của tài khoản đang đăng nhập
   */
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            avatarUrl: true,
            bio: true,
            location: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng #${userId}`);
    }

    return user;
  }

  /**
   * Cập nhật thông tin cá nhân (Họ tên, Bio, Location)
   */
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const { name, bio, location } = dto;

    await this.prisma.$transaction(async (tx) => {
      if (typeof name === 'string') {
        await tx.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      if (bio !== undefined || location !== undefined) {
        await tx.profile.upsert({
          where: { userId },
          create: {
            userId,
            bio,
            location,
          },
          update: {
            ...(bio !== undefined && { bio }),
            ...(location !== undefined && { location }),
          },
        });
      }
    });

    return this.getProfile(userId);
  }

  /**
   * Xem hồ sơ công khai của một thành viên khác theo ID
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            avatarUrl: true,
            bio: true,
            location: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng #${id}`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    const hashedPassword = await this.hashService.hashPassword(dto.password);

    const createdUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      },
      omit: {
        password: true,
      },
    });

    return createdUser;
  }

  async updateAvatar(userId: number, newAvatarUrl: string) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile?.avatarUrl) {
      deleteUploadedFile(existingProfile.avatarUrl);
    }

    const updatedProfile = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        avatarUrl: newAvatarUrl,
      },
      update: {
        avatarUrl: newAvatarUrl,
      },
    });

    return {
      userId,
      avatarUrl: updatedProfile.avatarUrl,
    };
  }
}
