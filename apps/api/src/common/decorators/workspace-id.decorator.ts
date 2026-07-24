import { BadRequestException, createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Extracts the workspace ID from the route params or X-Workspace-Id header.
 *
 * Priority:
 * 1. Route param `:workspaceId`
 * 2. Request header `X-Workspace-Id`
 *
 * Usage:
 * ```ts
 * @Get(':workspaceId/tasks')
 * getTasks(@WorkspaceId() wsId: string) { ... }
 * ```
 */
export const WorkspaceId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const workspaceId =
      (request.params.workspaceId as string) ||
      (request.headers['x-workspace-id'] as string);

    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    return workspaceId;
  },
);
