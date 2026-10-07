import { Body, Controller, Get, Post, UploadedFile } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { UserData } from '@/auth/interfaces/jwt.interface';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ApiImageUpload } from '@/shared/decorators/api-file.decorator';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { createImageValidationPipe } from '@/shared/pipes/image-validation.pipe';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng trong hệ thống' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới (Dành cho Quản trị viên)' })
  @ApiResponse({ status: 201, description: 'Tạo người dùng thành công' })
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Xem hồ sơ cá nhân của người dùng hiện tại',
    description:
      'Trích xuất thông tin người dùng từ JWT Access Token trong Header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin hồ sơ tài khoản thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực hoặc Bearer Token không hợp lệ / đã hết hạn',
  })
  getProfile(@CurrentUser() userData: UserData) {
    return {
      message: 'Xác thực tài khoản thành công',
      user: userData,
    };
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload và cập nhật ảnh đại diện cá nhân' })
  @ApiImageUpload('avatar', {
    folder: 'avatars',
    description: 'File ảnh đại diện (JPG, PNG, WEBP - Tối đa 2MB)',
  })
  @ResponseMessage('Cập nhật ảnh đại diện thành công!')
  async uploadAvatar(
    @CurrentUser('userId') userId: number,
    @UploadedFile(createImageValidationPipe({ maxSizeInMb: 2 }))
    file: Express.Multer.File,
  ) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const result = await this.usersService.updateAvatar(userId, avatarUrl);

    return {
      filename: file.filename,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      mimetype: file.mimetype,
      url: result.avatarUrl,
    };
  }
}
