import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
  @IsString({ message: 'Nội dung tin nhắn phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  @MaxLength(1000, { message: 'Tin nhắn không được vượt quá 1000 ký tự' })
  content: string;

  @IsOptional()
  @IsString({ message: 'Mã phòng phải là chuỗi ký tự' })
  roomId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID người nhận phải là một số nguyên' })
  receiverId?: number;
}
