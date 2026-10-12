import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ApiImageUpload } from '@/shared/decorators/api-file.decorator';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { createImageValidationPipe } from '@/shared/pipes/image-validation.pipe';
import { Public } from '@/shared/decorators/public.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách thành viên trong hệ thống (User Directory)',
    description:
      'Trả về danh sách người dùng kèm Avatar và Bio để hiển thị danh bạ hoặc tìm kiếm người nhắn tin. Tự động loại trừ tài khoản đang đăng nhập.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành viên thành công',
  })
  @ResponseMessage('Lấy danh sách thành viên thành công!')
  findAll(
    @CurrentUser('userId') currentUserId?: number,
    @Query() query?: QueryUserDto,
  ) {
    return this.usersService.findAll(currentUserId, query);
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Xem hồ sơ cá nhân đầy đủ của người dùng hiện tại',
    description:
      'Truy vấn CSDL lấy đầy đủ thông tin: họ tên, email, vai trò, avatar, bio, location.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin hồ sơ tài khoản thành công',
  })
  @ResponseMessage('Lấy thông tin hồ sơ tài khoản thành công!')
  getProfile(@CurrentUser('userId') userId: number) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Cập nhật thông tin hồ sơ cá nhân',
    description:
      'Cập nhật họ tên hiển thị, tiểu sử (bio) và địa điểm (location).',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật hồ sơ thành công' })
  @ResponseMessage('Cập nhật thông tin hồ sơ thành công!')
  updateProfile(
    @CurrentUser('userId') userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
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

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Xem hồ sơ công khai của một thành viên theo ID',
    description:
      'Bất kỳ ai cũng có thể xem hồ sơ công khai của thành viên khác.',
  })
  @ApiResponse({ status: 200, description: 'Lấy hồ sơ người dùng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ResponseMessage('Lấy thông tin hồ sơ người dùng thành công!')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới (Dành cho Quản trị viên)' })
  @ApiResponse({ status: 201, description: 'Tạo người dùng thành công' })
  @ResponseMessage('Tạo người dùng thành công!')
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }
}
