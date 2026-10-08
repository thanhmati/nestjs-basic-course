import { MAIL_TEMPLATE } from '@/shared/constants/mail.constant';
import { WelcomeMailData } from '@/shared/interfaces/mail.interface';
import { Injectable } from '@nestjs/common';
import { Mailable } from '@nestjs/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WelcomeMail implements Mailable<WelcomeMailData> {
  constructor(private configService: ConfigService) {}

  render({ name, email, joinedAt }: WelcomeMailData) {
    return {
      subject: `Chào mừng ${name || 'bạn'} đến với Social Chat App! 🎉`,
      template: MAIL_TEMPLATE.WELCOME,
      context: {
        name: name || 'Thành viên mới',
        email,
        joinedAt,
        appUrl: this.configService.get<string>('APP_URL'),
      },
    };
  }
}
