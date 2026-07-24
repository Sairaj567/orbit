import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ActivityService } from '../activity/activity.service';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async findAll(workspaceId: string) {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' },
      ],
    });

    return members;
  }

  async invite(workspaceId: string, actorId: string, dto: InviteMemberDto) {
    // Check if member already exists (by user email or pending invite)
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      const existingMember = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: existingUser.id,
        },
      });

      if (existingMember) {
        throw new BadRequestException('User is already a member of this workspace');
      }
    } else {
      const existingInvite = await this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          email: dto.email,
          status: 'PENDING',
        },
      });

      if (existingInvite) {
        throw new BadRequestException('An invitation to this email is already pending');
      }
    }

    // Determine if we attach to existing user or create a pending email invite
    const data = existingUser
      ? {
          workspaceId,
          userId: existingUser.id,
          role: dto.role,
          status: 'ACTIVE',
        }
      : {
          workspaceId,
          email: dto.email,
          role: dto.role,
          status: 'PENDING',
        };

    const newMember = await this.prisma.workspaceMember.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      userId: actorId,
      entityType: 'MEMBER',
      entityId: newMember.id,
      action: 'CREATED',
      metadata: { role: dto.role, email: dto.email },
    });

    this.realtimeService.broadcast({
      workspaceId,
      event: 'member.created',
      payload: newMember,
      actorId,
    });

    return newMember;
  }

  async updateRole(
    workspaceId: string,
    memberId: string,
    actorId: string,
    dto: UpdateMemberRoleDto,
  ) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Cannot change the role of a workspace owner');
    }

    if (dto.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Cannot assign owner role directly');
    }

    const updated = await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: {
          select: { id: true, email: true, displayName: true, avatarUrl: true },
        },
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      userId: actorId,
      entityType: 'MEMBER',
      entityId: memberId,
      action: 'UPDATED',
      metadata: { role: dto.role, memberEmail: member.email || updated.user?.email },
    });

    this.realtimeService.broadcast({
      workspaceId,
      event: 'member.updated',
      payload: updated,
      actorId,
    });

    return updated;
  }

  async remove(workspaceId: string, memberId: string, currentUserId: string) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
      include: { user: { select: { email: true } } }
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Cannot remove a workspace owner');
    }

    if (member.userId === currentUserId) {
      throw new ForbiddenException('You cannot remove yourself through this endpoint');
    }

    await this.prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    this.activityService.recordActivity({
      workspaceId,
      userId: currentUserId,
      entityType: 'MEMBER',
      entityId: memberId,
      action: 'DELETED',
      metadata: { memberEmail: member.email || member.user?.email },
    });

    this.realtimeService.broadcast({
      workspaceId,
      event: 'member.deleted',
      payload: { id: memberId },
      actorId: currentUserId,
    });

    return { success: true };
  }
}
