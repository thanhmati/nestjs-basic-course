import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { QueryNotificationDto } from './dto/query-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'Lấy danh sách thông báo của người dùng đang đăng nhập',
  })
  @Get()
  @ResponseMessage('Lấy danh sách thông báo thành công!')
  getUserNotifications(
    @CurrentUser('userId') userId: number,
    @Query() query: QueryNotificationDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @ApiOperation({
    summary: 'Đánh dấu tất cả thông báo là đã đọc',
  })
  @Patch('read-all')
  @ResponseMessage('Đánh dấu tất cả thông báo đã đọc thành công!')
  markAllAsRead(@CurrentUser('userId') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @ApiOperation({
    summary: 'Đánh dấu một thông báo cụ thể là đã đọc',
  })
  @Patch(':id/read')
  @ResponseMessage('Đánh dấu thông báo đã đọc thành công!')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }
}
