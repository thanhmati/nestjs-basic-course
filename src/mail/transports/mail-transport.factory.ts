import { ConfigService } from '@nestjs/config';
import { FileMailTransport, MailTransport, SmtpTransport } from '@nestjs/mail';

export function createMailTransport(
  configService: ConfigService,
): MailTransport {
  const transportType = configService.get<string>('MAIL_TRANSPORT', 'file');

  switch (transportType) {
    case 'file':
      return new FileMailTransport({
        directory: configService.get<string>('MAIL_DIRECTORY', 'var/mail'),
      });

    case 'smtp':
      return new SmtpTransport({
        url: configService.getOrThrow<string>('SMTP_URL'),
        pool: true,
      });

    default:
      throw new Error(
        `MAIL_TRANSPORT không hợp lệ: "${transportType}". Chỉ chấp nhận "file" hoặc "smtp".`,
      );
  }
}
