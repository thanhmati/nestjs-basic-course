import { PrismaService } from '@/prisma/prisma.service';
import { HashService } from '@/shared/services/hash.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // 1. Kiểm tra email duy nhất
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    // 2. Băm mật khẩu bằng HashService
    const hashedPassword = await this.hashService.hashPassword(password);

    // 3. Tạo User trong CSDL (loại bỏ trường password)
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
      omit: { password: true },
    });

    // 4. Phát hành Token
    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    return { user, accessToken };
  }

  private async generateAccessToken(
    userId: number,
    email: string,
    role: string,
  ) {
    const payload = { sub: userId, email, role };
    return this.jwtService.signAsync(payload);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Tìm user theo email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email không chính xác!');
    }

    // 2. So khớp mật khẩu với HashService
    const isPasswordValid = await this.hashService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác!');
    }

    // 3. Phát hành Token & ẩn password
    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    return { accessToken };
  }
}
