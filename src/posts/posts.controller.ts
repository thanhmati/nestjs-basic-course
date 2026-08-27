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
  DefaultValuePipe,
  Version,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';
import { BypassTransform } from 'src/shared/decorators/bypass-transform.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ResponseMessage('Tạo bài viết mới thành công')
  createPost(@Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(
      createPostDto.authorId,
      createPostDto.title,
      createPostDto.content,
    );
  }

  @Post('with-notification')
  async createPostWithNotification(@Body() body: CreatePostDto) {
    return await this.postsService.createPostWithNotification(
      body.authorId,
      body.title,
      body.content,
    );
  }

  @Version('2')
  @Get()
  findAllPostsV2(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.postsService.findAllPostsV2(search, page, limit);
  }

  @Version('1')
  @BypassTransform()
  @Get()
  findAllPosts() {
    return this.postsService.findAllPostsV1();
  }

  @Patch(':id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(
      id,
      updatePostDto.title,
      updatePostDto.content,
    );
  }

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
