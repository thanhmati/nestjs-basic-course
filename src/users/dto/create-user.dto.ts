import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class CreateUserDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  username: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid emal' })
  email: string;

  @IsNumber({}, { message: 'Age must be a number' })
  @IsNotEmpty({ message: 'Age is required' })
  @Min(0, { message: 'Age must be at least 0' })
  @Max(120, { message: 'Age must be at most 120' })
  age: number;

  @IsEnum(UserRole, { message: 'Role must be a valid role' })
  @IsNotEmpty({ message: 'Role is required' })
  @IsOptional()
  role?: UserRole = UserRole.USER;
}
