import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryPostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cursor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  take?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
