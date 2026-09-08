import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo bình luận mới cho bài viết
   */
  async createComment(
    postId: number,
    authorId: number,
    createCommentDto: CreateCommentDto,
  ) {
    // 1. Kiểm tra bài viết mục tiêu có tồn tại hay không
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID #${postId}`);
    }

    // 2. Tạo bình luận gắn liền với postId và authorId
    return await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Lấy danh sách bình luận của bài viết kèm phân trang
   */
  async findCommentsByPost(postId: number, query: QueryCommentDto) {
    // 1. Đảm bảo bài viết tồn tại
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID #${postId}`);
    }

    const { page = 1, limit = 10, order = 'desc' } = query;
    const skip = (page - 1) * limit;

    // 2. Truy vấn song song danh sách bình luận và tổng số lượng
    const [items, totalItems] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { createdAt: order },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Xem chi tiết 1 bình luận theo ID
   */
  async findOne(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Không tìm thấy bình luận với ID #${id}`);
    }

    return comment;
  }

  /**
   * Chỉnh sửa nội dung bình luận (Chỉ tác giả bình luận có quyền)
   */
  async updateComment(
    id: number,
    userId: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Không tìm thấy bình luận với ID #${id}`);
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa bình luận của người khác!',
      );
    }

    return await this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async removeComment(id: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Không tìm thấy bình luận với ID #${id}`);
    }

    const isCommentAuthor = comment.authorId === userId;
    const isPostAuthor = comment.post.authorId === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      throw new ForbiddenException(
        'Bạn không có quyền xóa bình luận này! Chỉ tác giả bình luận hoặc chủ bài viết mới được phép xóa.',
      );
    }

    await this.prisma.comment.delete({ where: { id } });

    return { id };
  }
}
