import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new HttpException(
      'Rate limit exceeded (4 requests/minute)',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
