import { Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  constructor(private readonly prisma: PrismaService) {}

  createPost(params: { authorId: number; title: string; content: string }) {
    const { authorId, content, title } = params;

    return this.prisma.post.create({
      data: {
        title,
        content,
        published: true,
        author: {
          connect: {
            id: authorId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async createPostWithNotification(params: {
    authorId: number;
    title: string;
    content: string;
  }) {
    const { authorId, content, title } = params;

    return this.prisma.$transaction(
      async (tx) => {
        const author = await tx.user.findUnique({
          where: { id: authorId },
        });

        if (!author) {
          throw new NotFoundException(
            `Không tìm thấy tác giả với ID ${authorId}`,
          );
        }

        const post = await tx.post.create({
          data: {
            content,
            title,
            author: {
              connect: {
                id: authorId,
              },
            },
          },
        });

        const notification = await tx.notification.create({
          data: {
            userId: authorId,
            content: `Bài viết "${post.title}" của bạn đã được phát hành thành công.`,
            title: 'Bài viết được phát hành thành công',
          },
        });

        this.logger.debug({ post, notification });

        throw new BadRequestException('TEST transaction');

        return post;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }

  async findAllPost(params: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, page = 1, limit = 10 } = params;

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
