import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { Public } from '../shared/decorators/public.decorator';
import { ResponseMessage } from '../shared/decorators/response-message.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({
    summary: 'Thêm bình luận mới dưới bài viết',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID của bài viết cần thêm bình luận',
    example: 1,
  })
  @Post('posts/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Thêm bình luận mới thành công!')
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('userId') userId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(postId, userId, createCommentDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Lấy danh sách bình luận của bài viết (Phân trang)',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID của bài viết cần lấy bình luận',
    example: 1,
  })
  @Get('posts/:postId/comments')
  @ResponseMessage('Lấy danh sách bình luận thành công!')
  findCommentsByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: QueryCommentDto,
  ) {
    return this.commentsService.findCommentsByPost(postId, query);
  }

  @Public()
  @ApiOperation({
    summary: 'Xem chi tiết một bình luận theo ID',
  })
  @ApiParam({ name: 'id', description: 'ID của bình luận', example: 1 })
  @Get('comments/:id')
  @ResponseMessage('Lấy chi tiết bình luận thành công!')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Chỉnh sửa nội dung bình luận',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của bình luận cần chỉnh sửa',
    example: 1,
  })
  @Patch('comments/:id')
  @ResponseMessage('Cập nhật bình luận thành công!')
  updateComment(
    @Param('id') id: number,
    @CurrentUser('userId') userId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(id, userId, updateCommentDto);
  }

  @ApiOperation({
    summary: 'Xóa bình luận',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của bình luận cần xóa',
    example: 1,
  })
  @Delete('comments/:id')
  @ResponseMessage('Xóa bình luận thành công!')
  removeComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.commentsService.removeComment(id, userId);
  }
}
