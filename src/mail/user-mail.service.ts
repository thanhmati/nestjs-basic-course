import { UserRegisteredEvent } from '@/auth/events/user-registered.event';
import { Injectable, Logger } from '@nestjs/common';
import { Mailer } from '@nestjs/mail';
import { WelcomeMail } from './mails/welcome.mail';

@Injectable()
export class UserMailService {
  private readonly logger = new Logger(UserMailService.name);
  constructor(private readonly mailer: Mailer) {}

  async sendMailWelcome(event: UserRegisteredEvent) {
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
