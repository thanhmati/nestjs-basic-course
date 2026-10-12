import { IsNotEmpty, IsString } from 'class-validator';

export class JoinRoomDto {
  @IsString({ message: 'Tên phòng phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên phòng không được để trống' })
  roomId: string;
}
