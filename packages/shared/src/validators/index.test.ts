import { describe, it, expect } from 'vitest';
import { workspaceSlugSchema } from './index';

describe('workspaceSlugSchema', () => {
  it('lowercases valid slug input', () => {
    const result = workspaceSlugSchema.parse('My-Demo-Slug');
    expect(result).toBe('my-demo-slug');
  });
});
