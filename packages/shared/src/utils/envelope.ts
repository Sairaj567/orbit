const ENVELOPE_MARKER = Symbol.for('ApiResponseEnvelope');

export interface EnvelopeResponse<T> {
  [ENVELOPE_MARKER]: true;
  data: T;
  meta?: Record<string, unknown>;
}

export function envelope<T>(data: T, meta?: Record<string, unknown>): EnvelopeResponse<T> {
  return {
    [ENVELOPE_MARKER]: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function isEnvelope(
  value: unknown,
): value is { data: unknown; meta?: Record<string, unknown> } {
  return typeof value === 'object' && value !== null && ENVELOPE_MARKER in value;
}
