import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Version,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { QueryPostDto } from './dto/query-post.dto';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({
    summary: 'Tạo bài viết mới',
    description: 'Yêu cầu Bearer Token của người dùng đang đăng nhập',
  })
  @ApiResponse({ status: 201, description: 'Tạo bài viết mới thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Token' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Tạo bài viết mới thành công!')
  createPost(
    @CurrentUser('userId') userId: number,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.createPost(userId, createPostDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Lấy danh sách bài viết (Offset-based Pagination)',
    description:
      'Phù hợp cho Web / Admin Dashboard với số trang (page) và giới hạn (limit)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bài viết thành công',
  })
  @Get()
  @ResponseMessage('Lấy danh sách bài viết phân trang thành công!')
  findAllOffset(@Query() query: QueryPostDto) {
    return this.postsService.findAllOffset(query);
  }

  @Public()
  @ApiOperation({
    summary: 'Lấy Newsfeed bài viết (Cursor-based Pagination)',
    description: 'Phù hợp cho bảng tin di động, cuộn vô tận (Infinite Scroll)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy newsfeed cuộn vô tận thành công',
  })
  @Get('feed')
  @ResponseMessage('Lấy newsfeed cuộn vô tận thành công!')
  findAllCursor(@Query() query: QueryPostDto) {
    return this.postsService.findAllCursor(query);
  }

  @Public()
  @ApiOperation({
    summary: 'Xem chi tiết bài viết theo ID',
    description: 'Trả về thông tin bài viết kèm tác giả và danh sách bình luận',
  })
  @ApiParam({ name: 'id', description: 'ID bài viết cần xem', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin chi tiết bài viết thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  @Version('1')
  @Get(':id')
  @ResponseMessage('Lấy thông tin chi tiết bài viết thành công!')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Chỉnh sửa bài viết',
    description: 'Chỉ chính chủ tác giả mới có quyền chỉnh sửa bài viết này',
  })
  @ApiParam({
    name: 'id',
    description: 'ID bài viết cần chỉnh sửa',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Cập nhật bài viết thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Token' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền chỉnh sửa bài viết',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
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
    description: 'Chỉ chính chủ tác giả mới có quyền xóa bài viết này',
  })
  @ApiParam({ name: 'id', description: 'ID bài viết cần xóa', example: 1 })
  @ApiResponse({ status: 200, description: 'Xóa bài viết thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực JWT Token' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa bài viết' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  @Delete(':id')
  @ResponseMessage('Xóa bài viết thành công!')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.postsService.remove(id, userId);
  }
}
