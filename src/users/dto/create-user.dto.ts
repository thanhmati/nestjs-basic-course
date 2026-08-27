import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsString({ message: 'Tên phải là chuỗi ký tự!' })
  @IsNotEmpty({ message: 'Tên không được để trống!' })
  @MinLength(3, { message: 'Tên phải có ít nhất 3 ký tự!' })
  name: string;

  @IsEmail(
    {},
    { message: 'Email không đúng định dạng chuẩn (VD: user@example.com)!' },
  )
  @IsNotEmpty({ message: 'Email không được để trống!' })
  email: string;

  @IsEnum(UserRole, { message: 'Role phải là USER hoặc MODERATOR!' })
  @IsOptional()
  role?: UserRole = UserRole.USER;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự!' })
  password: string;
}
