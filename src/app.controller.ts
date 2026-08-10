import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('config')
  getConfig() {
    const port = this.configService.get<number>('PORT');
    const dbUrl = this.configService.get<string>('DATABASE_URL');

    return {
      port,
      dbUrl,
      nodeEnv: this.configService.get<string>('NODE_ENV'),
    };
  }
}
