import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityEntityType, ActivityAction, envelope } from '@orbit/shared';
import { Prisma } from '@prisma/client';
import { RealtimeService } from '../realtime/realtime.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';

export interface RecordActivityParams {
  workspaceId: string;
  projectId?: string;
  userId: string;
  actorName?: string;
  entityType: ActivityEntityType;
  entityId: string;
  action: ActivityAction;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
    private readonly permissionsService: ProjectPermissionsService,
  ) {}

  /**
   * Records a user activity in the database.
   * This is a fire-and-forget operation by default, but returns the promise.
   */
  async recordActivity(params: RecordActivityParams) {
    try {
      let actorName = params.actorName;
      if (!actorName) {
        const user = await this.prisma.user.findUnique({
          where: { id: params.userId },
          select: { displayName: true },
        });
        actorName = user?.displayName || 'Unknown User';
      }

      const activity = await this.prisma.activity.create({
        data: {
          workspaceId: params.workspaceId,
          projectId: params.projectId,
          userId: params.userId,
          actorName,
          entityType: params.entityType,
          entityId: params.entityId,
          action: params.action,
          metadata: params.metadata ?? Prisma.JsonNull,
        },
      });

      this.realtimeService.broadcast({
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        event: 'activity.created',
        payload: activity,
        actorId: params.userId,
      });

      return activity;
    } catch (error) {
      this.logger.error(
        `Failed to record activity: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // We generally don't want to crash the main transaction for a failed activity log
    }
  }

  async getWorkspaceActivity(
    workspaceId: string,
    userId: string,
    limit: number = 50,
    cursor?: string,
  ) {
    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });
    if (!workspaceMember) throw new NotFoundException();

    const activities = await this.prisma.activity.findMany({
      where: {
        workspaceId,
        OR: [
          { projectId: null },
          { project: { members: { some: { workspaceMemberId: workspaceMember.id } } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
    });

    let nextCursor: string | undefined = undefined;
    if (activities.length > limit) {
      const nextItem = activities.pop();
      nextCursor = nextItem?.id;
    }

    return envelope(activities, {
      nextCursor,
    });
  }

  async getProjectActivity(
    workspaceId: string,
    userId: string,
    projectId: string,
    limit: number = 50,
    cursor?: string,
  ) {
    await this.permissionsService.requireProjectRole(workspaceId, projectId, userId, 'VIEWER');

    const activities = await this.prisma.activity.findMany({
      where: { workspaceId, projectId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    let nextCursor: string | undefined = undefined;
    if (activities.length > limit) {
      const nextItem = activities.pop();
      nextCursor = nextItem?.id;
    }

    return envelope(activities, {
      nextCursor,
    });
  }
}
