import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsListener } from './notifications.listener';

@Module({
  providers: [NotificationsService, NotificationsListener],
})
export class NotificationsModule {}
