import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(
    @Body() body: { authorId: number; title: string; content: string },
  ) {
    return await this.postsService.createPostWithNotification(
      body.authorId,
      body.title,
      body.content,
    );
  }

  @Get('feed')
  async getFeed(@Query('limit') limit?: string) {
    return await this.postsService.getOptimizedFeed(
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return await this.postsService.deletePost(parseInt(id, 10));
  }
}
