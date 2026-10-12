import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetHistoryDto {
  @Type(() => Number)
  @IsInt({ message: 'ID người nhận phải là một số nguyên' })
  receiverId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng tin nhắn phải là một số nguyên' })
  @Min(1, { message: 'Số lượng tin nhắn tối thiểu là 1' })
  @Max(100, { message: 'Số lượng tin nhắn tối đa là 100' })
  limit?: number = 20;
}
