import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên hiển thị của người dùng',
  })
  @IsOptional()
  @IsString({ message: 'Tên phải là một chuỗi ký tự!' })
  @MaxLength(100, { message: 'Tên không được vượt quá 100 ký tự!' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Lập trình viên Full-Stack đam mê NestJS và React',
    description: 'Tiểu sử cá nhân (Bio)',
  })
  @IsOptional()
  @IsString({ message: 'Tiểu sử phải là một chuỗi ký tự!' })
  @MaxLength(300, { message: 'Tiểu sử không được vượt quá 300 ký tự!' })
  bio?: string;

  @ApiPropertyOptional({
    example: 'Hà Nội, Việt Nam',
    description: 'Nơi sinh sống hoặc địa điểm làm việc',
  })
  @IsOptional()
  @IsString({ message: 'Địa điểm phải là một chuỗi ký tự!' })
  @MaxLength(100, { message: 'Địa điểm không được vượt quá 100 ký tự!' })
  location?: string;
}
