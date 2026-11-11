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
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveImageToDisk } from '@/shared/helpers/multer.helper';
import { createImageValidationPipe } from '@/shared/pipes/image-validation.pipe';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Public } from '@/shared/decorators/public.decorator';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload và cập nhật avatar' })
  @ResponseMessage('Cập nhật ảnh đại diện thành công')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: saveImageToDisk('avatars'),
    }),
  )
  async uploadAvatar(
    @CurrentUser('userId') userId: number,
    @UploadedFile(createImageValidationPipe({ maxSizeInMb: 2 }))
    file: Express.Multer.File,
  ) {
    const avatarUrl = `uploads/avatars/${file.filename}`;
    await this.usersService.updateAvatar(userId, avatarUrl);
    return {
      filename: file.filename,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      mimetype: file.mimetype,
      url: avatarUrl,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách thành viên trong hệ thống (User Directory)',
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
  })
  @ResponseMessage('Lấy thông tin hồ sơ tài khoản thành công!')
  getProfile(@CurrentUser('userId') userId: number) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Cập nhật thông tin hồ sơ cá nhân',
  })
  @ResponseMessage('Cập nhật thông tin hồ sơ thành công!')
  updateProfile(
    @CurrentUser('userId') userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Xem hồ sơ công khai của một thành viên theo ID',
  })
  @ResponseMessage('Lấy thông tin hồ sơ người dùng thành công!')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}
