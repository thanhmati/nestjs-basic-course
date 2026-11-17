import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@/shared/decorators/public.decorator';
import { BypassTransform } from '@/shared/decorators/bypass-transform.decorator';
import { PrismaService } from '@/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @BypassTransform()
  @HealthCheck()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái sức khỏe hệ thống (Database & RAM)',
  })
  @ApiResponse({
    status: 200,
    description: 'Hệ thống hoạt động bình thường, sẵn sàng tiếp nhận yêu cầu.',
  })
  @ApiResponse({
    status: 503,
    description:
      'Hệ thống đang gặp sự cố (CSDL không phản hồi hoặc RAM vượt ngưỡng an toàn).',
  })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.memoryHealth.checkHeap('memory_heap', 200 * 1024 * 1024),
      () => this.memoryHealth.checkRSS('memory_rss', 400 * 1024 * 1024),
    ]);
  }
}
