import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { WorkspaceRole } from '@prisma/client';
import { getWorkspaceIdFromRequest } from '../../common/utils';
import { PrismaService } from '../../prisma/prisma.service';
import { WORKSPACE_ROLES_KEY } from '../decorators';
import type { AuthenticatedRequest } from '../types';

const WORKSPACE_ROLE_RANK: Record<WorkspaceRole, number> = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

const WORKSPACE_ACCESS_DENIED_MESSAGE = 'Workspace not found or access denied';

@Injectable()
export class WorkspaceMembershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const rawIdentifier = getWorkspaceIdFromRequest(request);

    if (!rawIdentifier) {
      throw new ForbiddenException('Workspace ID or slug is required');
    }

    const workspace = await this.prisma.workspace.findFirst({
      where: {
        OR: [{ id: rawIdentifier }, { slug: rawIdentifier }],
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    if (!workspace) {
      throw new ForbiddenException(WORKSPACE_ACCESS_DENIED_MESSAGE);
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        userId: request.user.id,
        workspaceId: workspace.id,
        status: 'ACTIVE',
        workspace: {
          deletedAt: null,
        },
      },
      select: {
        id: true,
        role: true,
        nickname: true,
        userId: true,
        workspaceId: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException(WORKSPACE_ACCESS_DENIED_MESSAGE);
    }

    request.workspace = workspace;
    request.workspaceId = workspace.id;

    const requiredRoles =
      this.reflector.getAllAndOverride<WorkspaceRole[]>(WORKSPACE_ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (!this.hasRequiredRole(membership.role, requiredRoles)) {
      throw new ForbiddenException('Insufficient workspace role');
    }

    request.workspaceMembership = membership;

    return true;
  }

  private hasRequiredRole(currentRole: WorkspaceRole, requiredRoles: WorkspaceRole[]): boolean {
    if (requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.some(
      (role) => WORKSPACE_ROLE_RANK[currentRole] >= WORKSPACE_ROLE_RANK[role],
    );
  }
}
