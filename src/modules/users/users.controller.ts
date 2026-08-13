import { Controller, Post, Get, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body() body: { email: string; name?: string; password?: string },
  ) {
    return await this.usersService.createUser(body);
  }

  @Get()
  async getUsers() {
    return await this.usersService.getUsers();
  }
}
