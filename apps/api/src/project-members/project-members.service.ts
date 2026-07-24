import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class ProjectMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: ProjectPermissionsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async findAll(workspaceId: string, projectId: string, userId: string) {
    await this.permissionsService.requireProjectRole(workspaceId, projectId, userId, 'VIEWER');

    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        workspaceMember: {
          include: {
            user: true,
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });
  }

  async invite(workspaceId: string, projectId: string, userId: string, targetWorkspaceMemberId: string, role: 'VIEWER' | 'EDITOR' | 'OWNER') {
    await this.permissionsService.requireProjectRole(workspaceId, projectId, userId, 'OWNER');

    const existing = await this.prisma.projectMember.findUnique({
      where: {
        projectId_workspaceMemberId: {
          projectId,
          workspaceMemberId: targetWorkspaceMemberId
        }
      }
    });

    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        workspaceMemberId: targetWorkspaceMemberId,
        role: role as ProjectRole,
      },
      include: {
        workspaceMember: {
          include: { user: true }
        }
      }
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId,
      event: 'project.member.added',
      payload: member,
      actorId: userId,
    });

    return member;
  }

  async updateRole(workspaceId: string, projectId: string, userId: string, memberId: string, role: 'VIEWER' | 'EDITOR' | 'OWNER') {
    await this.permissionsService.requireProjectRole(workspaceId, projectId, userId, 'OWNER');

    const member = await this.prisma.projectMember.findFirst({
      where: { id: memberId, projectId },
    });

    if (!member) throw new NotFoundException();

    // Prevent changing your own role if you're the only owner
    if (role !== 'OWNER' && member.role === 'OWNER') {
      const owners = await this.prisma.projectMember.count({
        where: { projectId, role: 'OWNER' }
      });
      if (owners <= 1) {
        throw new ConflictException('Cannot change the role of the last owner');
      }
    }

    const updated = await this.prisma.projectMember.update({
      where: { id: memberId },
      data: { role: role as ProjectRole },
      include: {
        workspaceMember: {
          include: { user: true }
        }
      }
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId,
      event: 'project.member.updated',
      payload: updated,
      actorId: userId,
    });

    return updated;
  }

  async remove(workspaceId: string, projectId: string, userId: string, memberId: string) {
    const actor = await this.permissionsService.requireProjectRole(workspaceId, projectId, userId, 'VIEWER');
    
    const member = await this.prisma.projectMember.findFirst({
      where: { id: memberId, projectId },
    });

    if (!member) throw new NotFoundException();

    // A user can remove themselves (leave), or an OWNER can remove them
    if (actor.id !== member.id && actor.role !== 'OWNER') {
      await this.permissionsService.requireProjectRole(workspaceId, projectId, userId, 'OWNER'); // Force exception
    }

    if (member.role === 'OWNER') {
      const owners = await this.prisma.projectMember.count({
        where: { projectId, role: 'OWNER' }
      });
      if (owners <= 1) {
        throw new ConflictException('Cannot remove the last owner');
      }
    }

    await this.prisma.projectMember.delete({
      where: { id: memberId },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId,
      event: 'project.member.removed',
      payload: { id: memberId },
      actorId: userId,
    });

    return { id: memberId };
  }
}
