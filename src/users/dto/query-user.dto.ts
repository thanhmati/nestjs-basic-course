import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryUserDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tên hoặc email của người dùng',
    example: 'Alice',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Số lượng kết quả tối đa cần lấy (Mặc định: 50, Tối đa: 100)',
    example: 20,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
