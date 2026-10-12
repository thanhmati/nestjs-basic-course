import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({
    summary:
      'Lấy danh sách các cuộc trò chuyện gần đây của người dùng hiện tại',
    description:
      'Trả về danh sách đối tác chat, tin nhắn gần nhất, thời gian và số lượng tin nhắn chưa đọc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách cuộc trò chuyện thành công',
  })
  @ResponseMessage('Lấy danh sách cuộc trò chuyện thành công!')
  getConversations(@CurrentUser('userId') userId: number) {
    return this.chatService.getUserConversations(userId);
  }

  @Get('messages/:receiverId')
  @ApiOperation({
    summary:
      'Lấy lịch sử tin nhắn trực tiếp giữa người dùng hiện tại và một người nhận',
    description:
      'REST API tải lịch sử tin nhắn ban đầu để render giao diện trước khi kết nối realtime Socket.IO.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy lịch sử tin nhắn thành công',
  })
  @ResponseMessage('Lấy lịch sử tin nhắn thành công!')
  getMessages(
    @CurrentUser('userId') userId: number,
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getConversationHistory(
      userId,
      receiverId,
      limit ? Number(limit) : 50,
    );
  }

  @Patch('messages/:senderId/read')
  @ApiOperation({
    summary: 'Đánh dấu đã đọc toàn bộ tin nhắn từ một người gửi cụ thể',
  })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu tin nhắn đã đọc thành công',
  })
  @ResponseMessage('Đánh dấu tin nhắn đã đọc thành công!')
  markAsRead(
    @CurrentUser('userId') userId: number,
    @Param('senderId', ParseIntPipe) senderId: number,
  ) {
    return this.chatService.markMessagesAsRead(userId, senderId);
  }
}
