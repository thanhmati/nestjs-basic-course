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
import { JwtPayload } from './interfaces/jwt.interface';
import { Role } from '@/generated/prisma/enums';
import { GoogleUser } from './interfaces/google-user.interface';
import * as crypto from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT } from '@/shared/constants/event.constant';
import { UserRegisteredEvent } from '@/users/events/user-registered.event';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    const hashedPassword = await this.hashService.hashPassword(password);

    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
      omit: { password: true },
    });

    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    this.eventEmitter.emit(
      EVENT.USER.REGISTERED,
      new UserRegisteredEvent(user.id, user.email, user.name, user.createdAt),
    );

    return { user, accessToken };
  }

  private async generateAccessToken(userId: number, email: string, role: Role) {
    const payload: JwtPayload = { sub: userId, email, role };
    return this.jwtService.signAsync(payload);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email không chính xác!');
    }

    const isPasswordValid = await this.hashService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác!');
    }

    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    return { accessToken };
  }

  async socialLogin(googleUser: GoogleUser) {
    const { email, name } = googleUser;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword =
        await this.hashService.hashPassword(randomPassword);

      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });
    }

    const accessToken = await this.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      accessToken,
    };
  }
}
