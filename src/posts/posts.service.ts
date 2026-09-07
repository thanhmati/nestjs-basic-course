import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createPost(authorId: number, createPostDto: CreatePostDto) {
    return await this.prisma.post.create({
      data: {
        ...createPostDto,
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

  async findAllOffset(query: QueryPostDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, email: true, name: true },
          },
        },
      }),
      this.prisma.post.count({ where }),
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

  async findAllCursor(query: QueryPostDto) {
    const { cursor, take = 10, search } = query;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const items = await this.prisma.post.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { id: 'desc' },
      include: {
        author: {
          select: { id: true, email: true, name: true },
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

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, email: true, name: true } },
        comments: {
          select: { id: true, content: true, createdAt: true, authorId: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID #${id}`);
    }

    return post;
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài viết này');
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        author: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async remove(id: number, userId: number) {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    await this.prisma.post.delete({ where: { id } });

    return { id };
  }
}
