import { PrismaService } from '@/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { Role } from '@/generated/prisma/enums';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(postId: number, userId: number, body: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID #${postId}`);
    }

    return this.prisma.comment.create({
      data: {
        content: body.content,
        authorId: userId,
        postId,
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

  async findCommentsByPost(postId: number, query: QueryCommentDto) {
    const { cursor, take = 10 } = query;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID #${postId}`);
    }

    const items = await this.prisma.comment.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: { postId },
      take: take + 1,
      orderBy: { id: 'desc' },
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

    let hasNextPage = false;
    if (items.length > take) {
      hasNextPage = true;
      items.pop();
    }

    const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

    return {
      items,
      meta: {
        take,
        nextCursor,
        hasNextPage,
      },
    };
  }

  async removeComment(id: number, userId: number, role: Role) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: {
        authorId: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Không tìm thấy bình luận với ID #${id}`);
    }

    const isCommentAuthor = comment.authorId === userId;
    const isAdmin = role === Role.ADMIN;

    if (!isCommentAuthor && !isAdmin) {
      throw new ForbiddenException('Không có quyền xóa bình luận này');
    }

    await this.prisma.comment.delete({ where: { id } });

    return { id };
  }
}
