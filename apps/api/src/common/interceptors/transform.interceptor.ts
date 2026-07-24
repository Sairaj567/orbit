import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponseEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  errors: null;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponseEnvelope<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponseEnvelope<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the handler already returned an envelope shape, pass it through
        if (
          data !== null &&
          typeof data === 'object' &&
          'data' in data &&
          'errors' in data
        ) {
          return data as unknown as ApiResponseEnvelope<T>;
        }

        return {
          data,
          errors: null,
        };
      }),
    );
  }
}
