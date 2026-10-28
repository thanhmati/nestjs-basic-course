import { CommentCreatedEvent } from '@/comments/events/comment-created.event';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(event: CommentCreatedEvent) {
    if (event.postAuthorId === event.commentAuthorId) {
      this.logger.log(
        `⏭️ Bỏ qua tạo thông báo: Người dùng #${event.commentAuthorId} tự bình luận vào bài viết của chính mình.`,
      );
      return;
    }

    const previewContent =
      event.content.length > 60
        ? `${event.content.substring(0, 57)}...`
        : event.content;

    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: event.postAuthorId,
          title: 'Bình luận mới trên bài viết của bạn',
          content: `${event.commentAuthorName} đã bình luận: "${previewContent}"`,
        },
      });

      this.logger.log(
        `🔔 Đã tạo thông báo #${notification.id} thành công cho người dùng #${event.postAuthorId}`,
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `❌ Lỗi khi tạo bản ghi thông báo cho sự kiện comment.created: ${err.message}`,
        err.stack,
      );
    }
  }

  async getUserNotifications(userId: number, query: QueryNotificationDto) {
    const { cursor, take = 10 } = query;

    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        where: { userId },
        take: take + 1,
        orderBy: { id: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

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
        unreadCount,
      },
    };
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID #${id}`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        `Không có quyền đánh dấu thông báo này đã đọc`,
      );
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      updatedCount: result.count,
    };
  }
}
