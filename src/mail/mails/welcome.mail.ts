import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Mailable } from '@nestjs/mail';

export interface WelcomeMailData {
  name: string;
  email: string;
  joinedAt: string;
}

@Injectable()
export class WelcomeMail implements Mailable<WelcomeMailData> {
  constructor(private readonly configService: ConfigService) {}

  render({ name, email, joinedAt }: WelcomeMailData) {
    const appUrl = this.configService.get<string>('APP_URL');

    return {
      subject: `Chào mừng ${name || 'bạn'} đến với Social Chat App! 🎉`,
      template: 'welcome',
      context: {
        name: name || 'Thành viên mới',
        email,
        joinedAt,
        appUrl,
      },
    };
  }
}
