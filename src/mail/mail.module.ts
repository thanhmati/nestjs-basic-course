import { Module } from '@nestjs/common';
import { WelcomeMail } from './mails/welcome.mail';
import { MailListener } from './mail.listener';
import { UserMailService } from './user-mail.service';

@Module({
  providers: [WelcomeMail, MailListener, UserMailService],
  exports: [WelcomeMail],
})
export class AppMailModule {}
