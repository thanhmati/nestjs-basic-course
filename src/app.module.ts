import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './shared/filters/prisma-client-exception.filter';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { SharedServiceModule } from './shared/services/shared-service.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles-guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './shared/guards/custom-throttler.guard';
import { CommentsModule } from './comments/comments.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from './notifications/notifications.module';
import { FileTemplateEngine, MailModule } from '@nestjs/mail';
import { join } from 'path';
import { AppMailModule } from './mail/mail.module';
import { createMailTransport } from './mail/transports/mail-transport.factory';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: envValidationSchema,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      ignoreErrors: false,
    }),
    MailModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: createMailTransport(configService),
        templates: new FileTemplateEngine({
          dir: join(__dirname, 'mail/templates'),
          layout: 'layout',
          cache: configService.get<string>('NODE_ENV') === 'production',
        }),

        from: configService.get<string>(
          'MAIL_FROM',
          'Social Chat App <noreply@socialchat.example.com>',
        ),
      }),
    }),

    PrismaModule,
    SharedServiceModule,
    UsersModule,
    PostsModule,
    AuthModule,
    CommentsModule,
    NotificationsModule,
    AppMailModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude({
        path: 'health',
        method: RequestMethod.GET,
      })
      .forRoutes('{*path}');
  }
}
