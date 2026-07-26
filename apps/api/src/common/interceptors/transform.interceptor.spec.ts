import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { envelope } from '@orbit/shared';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  const mockContext = {} as ExecutionContext;

  it('wraps standard raw payload in data envelope with errors: null', (done) => {
    const mockCallHandler: CallHandler = {
      handle: () => of({ id: '1', name: 'Test' }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        data: { id: '1', name: 'Test' },
        errors: null,
      });
      done();
    });
  });

  it('wraps null payload in data: null, errors: null envelope', (done) => {
    const mockCallHandler: CallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        data: null,
        errors: null,
      });
      done();
    });
  });

  it('preserves pre-built envelope without double-wrapping', (done) => {
    const preEnveloped = envelope({ id: '1' }, { total: 1 });
    const mockCallHandler: CallHandler = {
      handle: () => of(preEnveloped),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        data: { id: '1' },
        meta: { total: 1 },
        errors: null,
      });
      done();
    });
  });

  it('wraps plain object containing data property as ordinary payload if not marked as envelope', (done) => {
    const plainObjWithData = { data: 'payload', value: 123 };
    const mockCallHandler: CallHandler = {
      handle: () => of(plainObjWithData),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        data: { data: 'payload', value: 123 },
        errors: null,
      });
      done();
    });
  });
});
