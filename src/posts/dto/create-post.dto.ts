import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Tiêu đề bài viết (tối thiểu 5 ký tự)',
    example: 'Xây dựng REST API hoàn chỉnh với NestJS & Prisma',
  })
  @IsString({ message: 'Tiêu đề bài viết phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tiêu đề bài viết không được để trống' })
  @MinLength(5, { message: 'Tiêu đề bài viết phải có ít nhất 5 ký tự' })
  title: string;

  @ApiProperty({
    description: 'Nội dung chi tiết của bài viết',
    example:
      'Bài viết này hướng dẫn chi tiết cách thiết kế schema và quan hệ database...',
  })
  @IsString({ message: 'Nội dung bài viết phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Nội dung bài viết không được để trống' })
  content: string;

  @ApiPropertyOptional({
    description: 'Trạng thái xuất bản bài viết công khai',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xuất bản phải là kiểu boolean' })
  published?: boolean;
}
