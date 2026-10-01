import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const timeToWait =
      throttlerLimitDetail.timeToBlockExpire ||
      throttlerLimitDetail.timeToExpire;

    const secondsToWait = Math.ceil(timeToWait / 1000);

    throw new ThrottlerException(
      `Bạn đã gửi quá nhiều yêu cầu! Vui lòng thử lại sau ${secondsToWait} giây.`,
    );
  }
}
