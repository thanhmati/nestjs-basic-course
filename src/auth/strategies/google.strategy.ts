import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleUser } from '../interfaces/google-user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;

    const email = emails?.[0]?.value;
    const fullName =
      `${name?.familyName || ''} ${name?.givenName || ''}`.trim() ||
      profile.displayName;
    const avatarUrl = photos?.[0]?.value;

    if (!email) {
      return done(
        new Error('Không tìm thấy thông tin email từ tài khoản Google!'),
        false,
      );
    }

    const user: GoogleUser = {
      email,
      name: fullName,
      avatarUrl,
      provider: 'google',
    };

    done(null, user);
  }
}
