import { Module } from '@nestjs/common';
import { WelcomeMail } from './mails/welcome.mail';
import { UserMailHandler } from './handlers/user-mail.handler';

@Module({
  providers: [WelcomeMail, UserMailHandler],
  exports: [WelcomeMail],
})
export class AppMailModule {}
