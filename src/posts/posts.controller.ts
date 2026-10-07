import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { QueryPostDto } from './dto/query-post.dto';
import { ApiImagesUpload } from '@/shared/decorators/api-file.decorator';
import { createImageValidationPipe } from '@/shared/pipes/image-validation.pipe';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({
    summary: 'Tạo bài viết mới',
  })
  @Post()
  @ResponseMessage('Tạo bài viết mới thành công')
  createPost(
    @CurrentUser('userId') userId: number,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(userId, createPostDto);
  }

  @Public()
  @ApiOperation({
    summary: 'Lấy danh sách bài viết (Offset-based Pagination)',
  })
  @Get()
  @ResponseMessage('Lấy danh sách bài viết phân trang thành công!')
  findAllOffset(@Query() query: QueryPostDto) {
    return this.postsService.findAllOffset(query);
  }

  @Public()
  @ApiOperation({
    summary: 'Lấy Newsfeed bài viết (Cursor-based Pagination)',
  })
  @Get('feed')
  @ResponseMessage('Lấy newsfeed cuộn vô tận thành công!')
  findAllCursor(@Query() query: QueryPostDto) {
    return this.postsService.findAllCursor(query);
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

  @Post('upload-images')
  @ApiOperation({
    summary: 'Upload danh sách ảnh đính kèm bài viết (Tối đa 5 ảnh)',
  })
  @ApiImagesUpload('images', {
    folder: 'posts',
    maxCount: 5,
    description: 'Chọn danh sách ảnh bài viết (Tối đa 5 file, mỗi file <= 5MB)',
  })
  @ResponseMessage('Tải lên danh sách ảnh bài viết thành công!')
  uploadPostImages(
    @UploadedFiles(createImageValidationPipe({ maxSizeInMb: 5 }))
    files: Express.Multer.File[],
  ) {
    const uploadedList = files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: `/uploads/posts/${file.filename}`,
    }));

    return {
      total: uploadedList.length,
      items: uploadedList,
    };
  }
}
