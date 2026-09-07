import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryPostDto {
  @ApiPropertyOptional({
    description: 'Số thứ tự trang (bắt đầu từ 1)',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang page phải là số nguyên' })
  @Min(1, { message: 'Số trang tối thiểu là 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bài viết trên 1 trang (tối đa 100)',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng bản ghi limit phải là số nguyên' })
  @Min(1, { message: 'Số lượng bản ghi tối thiểu là 1' })
  @Max(100, { message: 'Tối đa 100 bản ghi trên 1 trang' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Con trỏ (ID bài viết cuối cùng đã tải) cho infinite scroll',
    example: 105,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Cursor phải là ID của bài viết dạng số nguyên' })
  cursor?: number;

  @ApiPropertyOptional({
    description: 'Số lượng bài viết muốn lấy tiếp theo (Cursor pagination)',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Take phải là số nguyên' })
  @Min(1)
  @Max(100)
  take?: number = 10;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tiêu đề hoặc nội dung',
    example: 'NestJS',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
