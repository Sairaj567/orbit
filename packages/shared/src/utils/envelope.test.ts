import { describe, it, expect } from 'vitest';
import { envelope, isEnvelope } from './envelope';

describe('envelope & isEnvelope', () => {
  it('attaches Symbol.for("ApiResponseEnvelope") when creating an envelope', () => {
    const res = envelope({ foo: 'bar' }, { total: 10 });
    expect(res).toBeDefined();
    expect(res.data).toEqual({ foo: 'bar' });
    expect(res.meta).toEqual({ total: 10 });
    expect(isEnvelope(res)).toBe(true);
  });

  it('returns true for envelope objects created via envelope() helper', () => {
    const envObj = envelope({ id: 1 });
    expect(isEnvelope(envObj)).toBe(true);
  });

  it('returns false for raw objects, primitives, null, or undefined', () => {
    expect(isEnvelope({ data: 'hello' })).toBe(false);
    expect(isEnvelope({ data: 'hello', meta: {} })).toBe(false);
    expect(isEnvelope('string')).toBe(false);
    expect(isEnvelope(123)).toBe(false);
    expect(isEnvelope(null)).toBe(false);
    expect(isEnvelope(undefined)).toBe(false);
  });
});
