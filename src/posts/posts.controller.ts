import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  createPost(@Body() body: CreatePostDto) {
    return this.postsService.createPost(body);
  }

  @Get()
  findAllPosts(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.findAllPost({ limit, page, search });
  }

  @Patch(':id')
  updatePost(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePost(
      +id,
      updatePostDto.title,
      updatePostDto.content,
    );
  }

  @Delete(':id')
  deletePost(@Param('id') id: number) {
    return this.postsService.deletePost(+id);
  }
}
