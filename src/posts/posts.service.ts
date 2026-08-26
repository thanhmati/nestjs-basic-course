import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
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

  /**
   * PHẦN I DEMO: Interactive Transaction tạo bài viết kèm thông báo nguyên tử
   */
  async createPostWithNotification(
    authorId: number,
    title: string,
    content: string,
  ) {
    return await this.prisma.$transaction(
      async (tx) => {
        // Step 1: Bắt buộc kiểm tra tác giả tồn tại qua Transactional Client (tx)
        const author = await tx.user.findUnique({ where: { id: authorId } });

        if (!author) {
          throw new BadRequestException('Tác giả không tồn tại trên hệ thống!');
        }

        // Step 2: Tạo bài viết mới
        const post = await tx.post.create({
          data: {
            title,
            content,
            published: true,
            authorId,
          },
        });

        this.logger.debug({ post });

        // Step 3: Tạo notification thông báo
        const notification = await tx.notification.create({
          data: {
            userId: authorId,
            content: `Bài viết "${post.title}" của bạn đã được phát hành thành công.`,
            title: 'Thông báo tạo bài viết thành công',
          },
        });

        this.logger.debug({ notification });

        return post;
      },
      {
        maxWait: 5000, // Thời gian chờ tối đa Connection Pool (5s)
        timeout: 10000, // Thời gian thực thi tối đa Transaction (10s)
      },
    );
  }

  // 2. READ: Truy vấn danh sách bài viết phân trang & tìm kiếm từ khóa
  async findAllPostsV2(search?: string, page = 1, limit = 10) {
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

  async findAllPostsV1() {
    return this.prisma.post.findMany();
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
    return await this.prisma.post.delete({
      where: { id },
    });
  }
}
