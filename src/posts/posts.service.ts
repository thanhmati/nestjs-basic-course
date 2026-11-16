import { PrismaService } from '@/prisma/prisma.service';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Post } from '@/generated/prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectPinoLogger(PostsService.name) private readonly logger: PinoLogger,
  ) {}

  async create(authorId: number, body: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        ...body,
        author: {
          connect: {
            id: authorId,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const cacheKey = `post:${id}`;
    const cached = await this.cacheManager.get<Post>(cacheKey);
    if (cached) {
      this.logger.info(`[CACHE HIT] ${cacheKey}`);
      return cached;
    }

    this.logger.info(`[CACHE MISS] ${cacheKey} -> Query DB`);
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
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    await this.cacheManager.set(cacheKey, post, 60000);
    return post;
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài viết này');
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });

    await this.cacheManager.del(`post:${id}`);
    return updated;
  }

  async remove(id: number, userId: number) {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    await this.prisma.post.delete({ where: { id } });

    await this.cacheManager.del(`post:${id}`);
    return { id };
  }

  async findAllCursor(query: QueryPostDto) {
    const { cursor, search, take = 10 } = query;

    const items = await this.prisma.post.findMany({
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: take + 1,
      orderBy: { id: 'desc' },
      where: {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        published: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
        _count: {
          select: {
            comments: true,
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
}
