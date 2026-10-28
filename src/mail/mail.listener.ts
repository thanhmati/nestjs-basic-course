import { UserRegisteredEvent } from '@/auth/events/user-registered.event';
import { EVENT_NAME } from '@/shared/constants/event.constant';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserMailService } from './user-mail.service';

@Injectable()
export class MailListener {
  private readonly logger = new Logger(MailListener.name);
  constructor(private readonly userMailService: UserMailService) {}

  @OnEvent(EVENT_NAME.USER.REGISTERED)
  async sendWelcomeEmail(event: UserRegisteredEvent) {
    this.logger.debug(
      `📥 Nhận sự kiện 'user.registered' cho user #${event.userId} (${event.email})`,
    );

    await this.userMailService.sendMailWelcome(event);
  }
}
