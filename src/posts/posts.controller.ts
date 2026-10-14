import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({
    summary: 'Tạo bài viết mới',
  })
  @Post()
  @ResponseMessage('Tạo bài viết mới thành công!')
  create(
    @CurrentUser('userId') userId: number,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(userId, createPostDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Xem chi tiết bài viết theo ID',
  })
  @Get(':id')
  @ResponseMessage('Lấy thông tin chi tiết bài viết thành công!')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Chỉnh sửa bài viết',
  })
  @Patch(':id')
  @ResponseMessage('Cập nhật bài viết thành công!')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, userId, updatePostDto);
  }

  @ApiOperation({
    summary: 'Xóa bài viết',
  })
  @Delete(':id')
  @ResponseMessage('Xóa bài viết thành công!')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.postsService.remove(id, userId);
  }
}
