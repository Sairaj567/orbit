import type { Request } from 'express';
import { getWorkspaceIdFromRequest } from './request-workspace-id';

describe('getWorkspaceIdFromRequest', () => {
  it('should extract workspaceId from request params', () => {
    const req = { params: { workspaceId: 'ws_123' }, headers: {} } as unknown as Request;
    expect(getWorkspaceIdFromRequest(req)).toBe('ws_123');
  });
});
