import { BadRequestException, createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../../auth/types';

/**
 * Extracts the resolved canonical database workspace ID from the request context.
 *
 * Priority:
 * 1. Resolved `request.workspaceId` (populated by WorkspaceMembershipGuard)
 * 2. Route param `:workspaceId` or `:workspaceSlug`
 * 3. Request header `X-Workspace-Id`
 *
 * Usage:
 * ```ts
 * @Get('tasks')
 * getTasks(@WorkspaceId() wsId: string) { ... }
 * ```
 */
export const WorkspaceId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

  const workspaceId =
    request.workspaceId ||
    (request.params.workspaceId as string) ||
    (request.params.workspaceSlug as string) ||
    (request.headers['x-workspace-id'] as string);

  if (!workspaceId) {
    throw new BadRequestException('Workspace ID is required');
  }

  return workspaceId;
});
