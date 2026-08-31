import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
export declare class AppController {
    private readonly appService;
    private readonly configService;
    constructor(appService: AppService, configService: ConfigService);
    getHello(): Promise<string>;
    getConfig(): {
        nodeEnv: string | undefined;
        dbUrl: string | undefined;
        port: number | undefined;
    };
}
