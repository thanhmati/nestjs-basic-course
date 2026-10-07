import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { HashService } from '@/shared/services/hash.service';
import { deleteUploadedFile } from '@/shared/helpers/multer.helper';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  private users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ];

  findAll(): User[] {
    return this.users;
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
