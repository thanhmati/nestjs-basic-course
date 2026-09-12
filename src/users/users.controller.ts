import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ClientInfo,
  type IClientInfo,
} from '@/shared/decorators/client-info.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get('client-info')
  getClientInfo(@ClientInfo() clientInfo: IClientInfo) {
    return {
      message: 'Trích xuất thông tin Client từ Request thành công!',
      data: clientInfo,
    };
  }

  @Get('agent')
  getUserAgent(@ClientInfo('userAgent') agent: string) {
    return {
      userAgent: agent,
    };
  }
}
