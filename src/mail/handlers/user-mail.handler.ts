import { EVENT } from '@/shared/constants/event.constant';
import { UserRegisteredEvent } from '@/users/events/user-registered.event';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Mailer } from '@nestjs/mail';
import { WelcomeMail } from '../mails/welcome.mail';

@Injectable()
export class UserMailHandler {
  private readonly logger = new Logger(UserMailHandler.name);

  constructor(private readonly mailer: Mailer) {}

  @OnEvent(EVENT.USER.REGISTERED, { async: true })
  async handleUserRegistered(event: UserRegisteredEvent) {
    this.logger.log(
      `📥 Nhận sự kiện 'user.registered' cho user #${event.userId} (${event.email})`,
    );

    try {
      await this.mailer.send(WelcomeMail, {
        to: {
          name: event.name || 'Thành viên mới',
          address: event.email,
        },
        data: {
          name: event.name || 'Thành viên mới',
          email: event.email,
          joinedAt: event.createdAt.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      });

      this.logger.log(`✅ Đã gửi Welcome Email thành công cho ${event.email}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `❌ Lỗi gửi Welcome Email cho ${event.email}: ${err.message}`,
        err.stack,
      );
    }
  }
}
