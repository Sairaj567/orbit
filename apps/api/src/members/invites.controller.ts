import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { AuthenticatedRequest } from '../auth/types';
import { ActivityService } from '../activity/activity.service';
import { RealtimeService } from '../realtime/realtime.service';

@Controller('invites')
export class InvitesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly realtimeService: RealtimeService,
  ) {}

  @Get(':token')
  async getInvite(@Param('token') token: string) {
    const invite = await this.prisma.workspaceMember.findUnique({
      where: { id: token },
      include: { workspace: { select: { name: true, slug: true, avatarUrl: true } } },
    });

    if (!invite || invite.status !== 'PENDING') {
      throw new NotFoundException('Invite not found or already accepted');
    }

    return { data: invite };
  }

  @Post(':token/accept')
  @UseGuards(SessionAuthGuard)
  async acceptInvite(@Param('token') token: string, @Req() req: AuthenticatedRequest) {
    const invite = await this.prisma.workspaceMember.findUnique({
      where: { id: token },
      include: { workspace: true },
    });

    if (!invite || invite.status !== 'PENDING') {
      throw new NotFoundException('Invite not found or already accepted');
    }

    if (invite.email && invite.email !== req.user!.email) {
      throw new ForbiddenException('This invite was sent to a different email address');
    }

    // Check if user is already in the workspace
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: invite.workspaceId, userId: req.user!.id, status: 'ACTIVE' },
    });

    if (existingMember) {
      throw new BadRequestException('You are already a member of this workspace');
    }

    const updatedMember = await this.prisma.workspaceMember.update({
      where: { id: token },
      data: {
        status: 'ACTIVE',
        userId: req.user!.id,
        joinedAt: new Date(),
      },
      include: {
        workspace: true,
        user: { select: { id: true, email: true, displayName: true, avatarUrl: true } },
      },
    });

    this.activityService.recordActivity({
      workspaceId: invite.workspaceId,
      userId: req.user!.id,
      entityType: 'MEMBER',
      entityId: updatedMember.id,
      action: 'UPDATED',
      metadata: { status: 'ACTIVE', note: 'Invite accepted' },
    });

    this.realtimeService.broadcast({
      workspaceId: invite.workspaceId,
      event: 'member.updated',
      payload: updatedMember,
      actorId: req.user!.id,
    });

    return { data: updatedMember };
  }
}
