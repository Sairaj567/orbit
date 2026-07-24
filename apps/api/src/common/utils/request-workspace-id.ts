import type { Request } from 'express';

export function getWorkspaceIdFromRequest(request: Request): string | undefined {
  const params = request.params as Record<string, string | undefined>;
  const header = request.headers['x-workspace-id'];

  if (params.workspaceId) return params.workspaceId;
  if (params.wsId) return params.wsId;
  if (typeof header === 'string') return header;
  if (Array.isArray(header)) return header[0];

  return undefined;
}
