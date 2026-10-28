import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsListener } from './notifications.listener';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsListener],
})
export class NotificationsModule {}
