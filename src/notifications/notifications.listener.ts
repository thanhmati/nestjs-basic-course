import { CommentCreatedEvent } from '@/comments/events/comment-created.event';
import { EVENT_NAME } from '@/shared/constants/event.constant';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent(EVENT_NAME.COMMENT.CREATED)
  async handleCommentCreatedEvent(event: CommentCreatedEvent) {
    this.logger.debug(
      `Bắt sự kiện ${EVENT_NAME.COMMENT.CREATED} với dữ liệu: ${JSON.stringify(event)}`,
    );

    await this.notificationsService.create(event);
  }
}
