import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => key),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn().mockResolvedValue(11),
            },
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return greeting with user count', async () => {
      expect(await appController.getHello()).toBe(
        'Xin chào! Social Chat App có tổng cộng 11 người dùng trong CSDL.',
      );
    });
  });
});
