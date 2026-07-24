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

    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_workspaceMemberId: {
          projectId,
          workspaceMemberId: workspaceMember.id,
        },
      },
      include: {
        project: true,
      }
    });

    if (!projectMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    if (projectMember.project.workspaceId !== workspaceId) {
       throw new ForbiddenException('Project does not belong to this workspace');
    }

    const roleOrder = { VIEWER: 0, EDITOR: 1, OWNER: 2 };
    if (roleOrder[projectMember.role] < roleOrder[minRole]) {
      throw new ForbiddenException(`You need at least ${minRole} access`);
    }

    return projectMember;
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
