import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);
  const globalPrefix = configService.get<string>('GLOBAL_PREFIX');
  const versionPrefix = configService.get<string>('VERSION_PREFIX');
  const versionApi = configService.get<string>('VERSION_API');

  app.setGlobalPrefix(globalPrefix || 'api');

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: versionPrefix,
    defaultVersion: versionApi,
  });

  await app.listen(port);
  console.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}/${versionPrefix}${versionApi}`,
  );
}
void bootstrap();
