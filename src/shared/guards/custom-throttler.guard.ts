import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const { timeToBlockExpire } = throttlerLimitDetail;

    const secondsToWait = Math.ceil(timeToBlockExpire / 1000);

    throw new ThrottlerException(
      `Bạn đã gửi quá nhiều yêu cầu! Vui lòng thử lại sau ${secondsToWait} giây.`,
    );
  }
}
