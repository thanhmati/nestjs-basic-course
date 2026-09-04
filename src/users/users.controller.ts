import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ClientInfo,
  type ClientInfoData,
} from 'src/shared/decorators/client-info.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get('client-info')
  getClientInfo(@ClientInfo() client: ClientInfoData) {
    return {
      message: 'Trích xuất thông tin Client từ Request thành công!',
      data: client,
    };
  }

  @Get('agent')
  getUserAgent(@ClientInfo('userAgent') agent: string) {
    return {
      userAgent: agent,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ResponseMessage('Lấy thông tin cá nhân thành công!')
  getProfile(@Request() req: Express.Request) {
    return {
      message: 'Thông tin tài khoản xác thực từ Token',
      user: req.user,
    };
  }
}
