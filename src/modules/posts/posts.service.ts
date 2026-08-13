import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

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
        const author = await tx.user.findUnique({
          where: { id: authorId },
        });

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

        // Step 3: Tạo notification thông báo
        await tx.notification.create({
          data: {
            userId: authorId,
            content: `Bài viết "${post.title}" của bạn đã được phát hành thành công.`,
            title: 'Thông báo tạo bài viết thành công',
          },
        });

        return post;
      },
      {
        maxWait: 5000, // Thời gian chờ tối đa Connection Pool (5s)
        timeout: 10000, // Thời gian thực thi tối đa Transaction (10s)
      },
    );
  }

  /**
   * PHẦN II DEMO: Truy vấn danh sách bài viết tối ưu chống N+1 Query
   */
  async getOptimizedFeed(limit = 10) {
    return await this.prisma.post.findMany({
      take: limit,
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        // Eager load tác giả bằng Nested Select (01 Single SQL Query JOIN)
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // Count bình luận bằng SQL Aggregate Counter (Không bị N+1)
        _count: {
          select: { comments: true },
        },
      },
    });
  }
}
