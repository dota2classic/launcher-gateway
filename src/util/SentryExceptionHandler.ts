import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { inspect } from 'util';

@Catch()
export class SentryExceptionHandler implements ExceptionFilter {
  constructor(@InjectSentry() private readonly client: SentryService) {}
  catch(exception: unknown, host: ArgumentsHost) {
    console.log(inspect(exception))
  }
}
