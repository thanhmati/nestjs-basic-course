import { IsNotEmpty, IsString } from 'class-validator';

export class AddressDto {
  @IsString({ message: 'Tên đường phải là chuỗi ký tự!' })
  @IsNotEmpty({ message: 'Tên đường không được để trống!' })
  street: string;

  @IsString({ message: 'Tên thành phố phải là chuỗi ký tự!' })
  @IsNotEmpty({ message: 'Tên thành phố không được để trống!' })
  city: string;
}
