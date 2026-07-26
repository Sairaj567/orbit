import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { isEnvelope } from '@orbit/shared';

export interface ApiResponseEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  errors: null;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseEnvelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponseEnvelope<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return {
            data: null as unknown as T,
            errors: null,
          };
        }

        // If the handler returned an explicit envelope marker, preserve envelope
        if (isEnvelope(data)) {
          const obj = data as { data: T; meta?: Record<string, unknown> };
          return {
            data: obj.data,
            ...(obj.meta ? { meta: obj.meta } : {}),
            errors: null,
          };
        }

        return {
          data,
          errors: null,
        };
      }),
    );
  }
}
