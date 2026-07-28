import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectPermissionsService {
  constructor(private prisma: PrismaService) {}

  async requireProjectRole(
    workspaceId: string,
    projectId: string,
    userId: string,
    minRole: 'VIEWER' | 'EDITOR' | 'OWNER',
  ) {
    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });

    if (!workspaceMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { workspaceMemberId: workspaceMember.id },
        },
      },
    });

    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    if (project.workspaceId !== workspaceId) {
      throw new ForbiddenException('Project does not belong to this workspace');
    }

    const projectMember = project.members[0];
    const roleOrder = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

    // Explicit project member check
    if (projectMember && roleOrder[projectMember.role] >= roleOrder[minRole]) {
      return projectMember;
    }

    // Fallback to visibility semantics if only VIEWER access is required
    if (minRole === 'VIEWER') {
      if (project.visibility === 'WORKSPACE') {
        return null;
      }

      if (project.visibility === 'ASSIGNEES') {
        const hasTaskAssigned = await this.prisma.taskAssignee.findFirst({
          where: {
            userId: userId,
            task: { projectId },
          },
        });
        if (hasTaskAssigned) {
          return null;
        }
      }
    }

    throw new ForbiddenException(`You need at least ${minRole} access`);
  }

  async requireWorkspaceRole(
    workspaceId: string,
    userId: string,
    minRole: 'VIEWER' | 'MEMBER' | 'ADMIN' | 'OWNER',
  ) {
    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });

    if (!workspaceMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const roleOrder = { VIEWER: 0, MEMBER: 1, ADMIN: 2, OWNER: 3 };
    if (roleOrder[workspaceMember.role] < roleOrder[minRole]) {
      throw new ForbiddenException(`You need at least ${minRole} workspace access`);
    }

    return workspaceMember;
  }

  async getProjectMember(workspaceId: string, projectId: string, userId: string) {
    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });
    if (!workspaceMember) return null;

    return this.prisma.projectMember.findUnique({
      where: {
        projectId_workspaceMemberId: {
          projectId,
          workspaceMemberId: workspaceMember.id,
        },
      },
    });
  }
}
