import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comment.service';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Public } from '@/shared/decorators/public.decorator';
import { QueryCommentDto } from './dto/query-comment.dto';
import { type UserData } from '@/auth/interfaces/jwt.interface';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({
    summary: 'Thêm bình luận mới dưới bài viết',
  })
  @Post('posts/:postId/comments')
  @ResponseMessage('Thêm bình luận mới thành công!')
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('userId') userId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, userId, createCommentDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Lấy danh sách bình luận của bài viết (Cursor Pagination)',
  })
  @Get('posts/:postId/comments')
  @ResponseMessage('Lấy danh sách bình luận thành công!')
  findCommentsByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: QueryCommentDto,
  ) {
    return this.commentsService.findCommentsByPost(postId, query);
  }

  @ApiOperation({
    summary: 'Xóa bình luận',
  })
  @Delete('comments/:id')
  @ResponseMessage('Xóa bình luận thành công!')
  removeComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserData,
  ) {
    return this.commentsService.removeComment(id, user.userId, user.role);
  }
}
