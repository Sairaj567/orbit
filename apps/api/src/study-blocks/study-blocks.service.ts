import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStudyBlockInput,
  UpdateStudyBlockInput,
  CompleteStudyBlockInput,
} from '@orbit/shared';
import { ActivityService } from '../activity/activity.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';

@Injectable()
export class StudyBlocksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly realtimeService: RealtimeService,
    private readonly permissionsService: ProjectPermissionsService,
  ) {}

  async create(workspaceId: string, userId: string, data: CreateStudyBlockInput) {
    await this.permissionsService.requireProjectRole(workspaceId, data.projectId, userId, 'VIEWER');

    // Ensure user doesn't already have an active study block in this workspace
    const existingActive = await this.findActive(workspaceId, userId);
    if (existingActive) {
      throw new BadRequestException('You already have an active study block.');
    }

    if (data.taskId) {
      const task = await this.prisma.task.findUnique({ where: { id: data.taskId } });
      if (!task || task.workspaceId !== workspaceId || task.projectId !== data.projectId) {
        throw new NotFoundException('Task not found or does not belong to this project');
      }
    }

    if (data.habitId) {
      const habit = await this.prisma.habit.findUnique({ where: { id: data.habitId } });
      if (!habit || habit.workspaceId !== workspaceId || habit.projectId !== data.projectId) {
        throw new NotFoundException('Habit not found or does not belong to this project');
      }
    }

    const studyBlock = await this.prisma.studyBlock.create({
      data: {
        workspaceId,
        projectId: data.projectId,
        taskId: data.taskId,
        habitId: data.habitId,
        userId,
        plannedDuration: data.plannedDuration,
        status: 'RUNNING',
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: studyBlock.projectId,
      userId,
      entityType: 'STUDY_BLOCK',
      entityId: studyBlock.id,
      action: 'CREATED',
      metadata: { plannedDuration: studyBlock.plannedDuration },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: studyBlock.projectId,
      event: 'studyBlock.created',
      payload: studyBlock,
      actorId: userId,
    });

    return studyBlock;
  }

  async findActive(workspaceId: string, userId: string) {
    return this.prisma.studyBlock.findFirst({
      where: {
        workspaceId,
        userId,
        status: 'RUNNING',
      },
    });
  }

  async findHistory(workspaceId: string, userId: string, limit: number = 10) {
    return this.prisma.studyBlock.findMany({
      where: {
        workspaceId,
        userId,
        status: { in: ['COMPLETED', 'CANCELLED'] },
      },
      orderBy: { endedAt: 'desc' },
      take: limit,
      include: {
        project: { select: { name: true, id: true } },
      },
    });
  }

  async findOne(workspaceId: string, userId: string, id: string) {
    const studyBlock = await this.prisma.studyBlock.findUnique({
      where: { id, workspaceId },
    });

    if (!studyBlock) {
      throw new NotFoundException(`Study Block with ID ${id} not found`);
    }

    // Only the creator can modify their study block
    if (studyBlock.userId !== userId) {
      throw new BadRequestException('You can only access your own study blocks');
    }

    return studyBlock;
  }

  async update(workspaceId: string, userId: string, id: string, data: UpdateStudyBlockInput) {
    const existing = await this.findOne(workspaceId, userId, id);

    if (existing.status !== 'RUNNING') {
      throw new BadRequestException('Cannot update a completed or cancelled study block.');
    }

    const studyBlock = await this.prisma.studyBlock.update({
      where: { id },
      data: {
        notes: data.notes !== undefined ? data.notes : undefined,
        actualDuration: data.actualDuration !== undefined ? data.actualDuration : undefined,
      },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: studyBlock.projectId,
      event: 'studyBlock.updated',
      payload: studyBlock,
      actorId: userId,
    });

    return studyBlock;
  }

  async complete(workspaceId: string, userId: string, id: string, data: CompleteStudyBlockInput) {
    const existing = await this.findOne(workspaceId, userId, id);

    if (existing.status !== 'RUNNING') {
      throw new BadRequestException('Study block is not running.');
    }

    const studyBlock = await this.prisma.studyBlock.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        notes: data.notes !== undefined ? data.notes : undefined,
        actualDuration: data.actualDuration,
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: studyBlock.projectId,
      userId,
      entityType: 'STUDY_BLOCK',
      entityId: studyBlock.id,
      action: 'COMPLETED',
      metadata: { actualDuration: studyBlock.actualDuration },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: studyBlock.projectId,
      event: 'studyBlock.updated',
      payload: studyBlock,
      actorId: userId,
    });

    return studyBlock;
  }

  async cancel(workspaceId: string, userId: string, id: string) {
    const existing = await this.findOne(workspaceId, userId, id);

    if (existing.status !== 'RUNNING') {
      throw new BadRequestException('Study block is not running.');
    }

    const studyBlock = await this.prisma.studyBlock.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        endedAt: new Date(),
      },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: studyBlock.projectId,
      event: 'studyBlock.updated',
      payload: studyBlock,
      actorId: userId,
    });

    return studyBlock;
  }
}
