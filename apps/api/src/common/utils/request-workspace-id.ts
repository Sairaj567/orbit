import type { Request } from 'express';

export function getWorkspaceIdFromRequest(request: Request): string | undefined {
  const req = request as Request & { workspaceId?: string };
  if (req.workspaceId) return req.workspaceId;

  const params = request.params as Record<string, string | undefined>;
  const header = request.headers['x-workspace-id'];

  // URL route parameters always take precedence over X-Workspace-Id header to prevent workspace spoofing attacks.
  if (params.workspaceId) return params.workspaceId;
  if (params.workspaceSlug) return params.workspaceSlug;
  if (params.wsId) return params.wsId;
  if (typeof header === 'string') return header;
  if (Array.isArray(header)) return header[0];

  return undefined;
}
