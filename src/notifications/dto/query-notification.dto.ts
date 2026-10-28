import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class QueryNotificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cursor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  take?: number;
}
