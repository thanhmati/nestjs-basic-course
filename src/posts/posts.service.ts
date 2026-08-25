import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. CREATE: Tạo bài viết mới kèm tác giả
  async createPost(authorId: number, title: string, content: string) {
    return await this.prisma.post.create({
      data: {
        title,
        content,
        published: true,
        author: {
          connect: { id: authorId },
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // 2. READ: Truy vấn danh sách bài viết phân trang & tìm kiếm từ khóa
  async findAllPosts(search?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.PostWhereInput = {
      published: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: {
            select: { id: true, name: true },
          },
          _count: {
            select: { comments: true }, // Đếm số bình luận mà không cần nạp mảng comments!
          },
        },
      }),
      this.prisma.post.count({ where: whereCondition }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // 3. UPDATE: Cập nhật bài viết theo ID
  async updatePost(id: number, title?: string, content?: string) {
    try {
      return await this.prisma.post.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
        },
      });
    } catch {
      throw new NotFoundException(`Không tìm thấy bài viết với ID ${id}`);
    }
  }

  // 4. DELETE: Xóa bài viết
  async deletePost(id: number) {
    try {
      return await this.prisma.post.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(
        `Không thể xóa! Bài viết ID ${id} không tồn tại.`,
      );
    }
  }
}
