import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RRule } from 'rrule';
import { ActivityService } from '../activity/activity.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';
import { AiService } from '../ai/ai.service';
import { envelope } from '@orbit/shared';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '@orbit/shared';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly realtimeService: RealtimeService,
    private readonly permissionsService: ProjectPermissionsService,
    private readonly aiService: AiService,
  ) {}

  async create(workspaceId: string, creatorId: string, data: CreateTaskInput) {
    if (data.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        data.projectId,
        creatorId,
        'EDITOR',
      );
    } else {
      await this.permissionsService.requireWorkspaceRole(workspaceId, creatorId, 'MEMBER');
    }
    const { assigneeIds, ...taskData } = data;

    if (assigneeIds && assigneeIds.length > 0) {
      const validMembers = await this.prisma.workspaceMember.count({
        where: { workspaceId, userId: { in: assigneeIds }, status: 'ACTIVE' },
      });
      if (validMembers !== assigneeIds.length) {
        throw new ForbiddenException(
          'One or more assignees are not active members of this workspace',
        );
      }
    }

    const task = await this.prisma.task.create({
      data: {
        ...taskData,
        workspaceId,
        creatorId,
        assignees: assigneeIds
          ? {
              create: assigneeIds.map((userId) => ({ userId })),
            }
          : undefined,
      },
      include: {
        assignees: true,
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: taskData.projectId || undefined,
      userId: creatorId,
      entityType: 'TASK',
      entityId: task.id,
      action: 'CREATED',
      metadata: { title: task.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: task.projectId || undefined,
      event: 'task.created',
      payload: task,
      actorId: creatorId,
    });

    // Fire & forget embedding generation
    this.aiService.embedEntity(task.id, 'Task', `${task.title}\n${task.description || ''}`);

    return task;
  }

  async findAll(workspaceId: string, userId: string, query: TaskQueryInput) {
    const {
      page,
      perPage,
      sortBy,
      sortOrder,
      search,
      status,
      priority,
      categoryId,
      assigneeId,
      projectId,
      tags,
    } = query;
    const skip = (page - 1) * perPage;

    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });
    if (!workspaceMember) throw new NotFoundException();

    if (projectId) {
      await this.permissionsService.requireProjectRole(workspaceId, projectId, userId, 'VIEWER');
    }

    const where = {
      workspaceId,
      deletedAt: null,
      ...(!projectId && {
        OR: [
          { projectId: null },
          { project: { members: { some: { workspaceMemberId: workspaceMember.id } } } },
        ],
      }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(categoryId && { categoryId }),
      ...(projectId && { projectId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
      ...(assigneeId && {
        assignees: {
          some: { userId: assigneeId },
        },
      }),
    };

    const [total, tasks] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        skip,
        take: perPage,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: {
          assignees: true,
        },
      }),
    ]);

    return envelope(tasks, {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  }

  async findOne(workspaceId: string, userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: { assignees: true, comments: true, resources: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        task.projectId,
        userId,
        'VIEWER',
      );
    }

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(workspaceId: string, userId: string, id: string, data: UpdateTaskInput) {
    const existingTask = await this.findOne(workspaceId, userId, id); // Ensure it exists and user has VIEWER

    if (existingTask.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        existingTask.projectId,
        userId,
        'EDITOR',
      );
    } else {
      await this.permissionsService.requireWorkspaceRole(workspaceId, userId, 'MEMBER');
    }

    if (data.projectId !== undefined && data.projectId !== existingTask.projectId) {
      if (data.projectId) {
        await this.permissionsService.requireProjectRole(
          workspaceId,
          data.projectId,
          userId,
          'EDITOR',
        );
      } else {
        await this.permissionsService.requireWorkspaceRole(workspaceId, userId, 'MEMBER');
      }
    }

    const { assigneeIds, ...taskData } = data;

    if (assigneeIds && assigneeIds.length > 0) {
      const validMembers = await this.prisma.workspaceMember.count({
        where: { workspaceId, userId: { in: assigneeIds }, status: 'ACTIVE' },
      });
      if (validMembers !== assigneeIds.length) {
        throw new ForbiddenException(
          'One or more assignees are not active members of this workspace',
        );
      }
    }

    const isNowDone = data.status === 'DONE' && existingTask.status !== 'DONE';
    const isNowUndone = data.status && data.status !== 'DONE' && existingTask.status === 'DONE';

    let completedAt = existingTask.completedAt;
    if (isNowDone) completedAt = new Date();
    else if (isNowUndone) completedAt = null;

    // Check if we need to clone for recurrence
    if (
      data.status === 'DONE' &&
      existingTask.status !== 'DONE' &&
      existingTask.rrule &&
      !existingTask.nextOccurrenceId
    ) {
      try {
        const rule = RRule.fromString(existingTask.rrule);

        let nextDate: Date | null = null;
        if (existingTask.recurrenceType === 'RELATIVE') {
          // Relative to today
          const now = new Date();
          const ruleRelative = RRule.fromString(
            `DTSTART:${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n${existingTask.rrule}`,
          );
          nextDate = ruleRelative.after(now);
        } else {
          // Fixed - find next date after today
          nextDate = rule.after(new Date());
        }

        if (nextDate) {
          // Execute in transaction
          const result = await this.prisma.$transaction(async (tx) => {
            const clonedTask = await tx.task.create({
              data: {
                title: existingTask.title,
                description: existingTask.description,
                priority: existingTask.priority,
                dueDate: nextDate,
                estimatedDuration: existingTask.estimatedDuration,
                tags: existingTask.tags,
                workspaceId,
                creatorId: existingTask.creatorId,
                categoryId: existingTask.categoryId,
                rrule: existingTask.rrule,
                timezone: existingTask.timezone,
                recurrenceType: existingTask.recurrenceType,
                rootTaskId: existingTask.rootTaskId || existingTask.id,
                assignees: {
                  create: existingTask.assignees.map((a) => ({ userId: a.userId })),
                },
              },
            });

            // Mark current as DONE and set nextOccurrenceId
            const updatedOriginal = await tx.task.update({
              where: { id },
              data: {
                ...taskData,
                status: 'DONE',
                completedAt: new Date(),
                nextOccurrenceId: clonedTask.id,
                assignees: assigneeIds
                  ? {
                      deleteMany: {},
                      create: assigneeIds.map((userId) => ({ userId })),
                    }
                  : undefined,
              },
              include: {
                assignees: true,
              },
            });

            return { updatedOriginal, clonedTask };
          });

          // Emit events for the cloned task outside transaction
          this.activityService.recordActivity({
            workspaceId,
            projectId: result.clonedTask.projectId || undefined,
            userId,
            entityType: 'TASK',
            entityId: result.clonedTask.id,
            action: 'CREATED',
            metadata: { title: result.clonedTask.title, isRecurrence: true },
          });

          this.realtimeService.broadcast({
            workspaceId,
            projectId: result.clonedTask.projectId || undefined,
            event: 'task.created',
            payload: result.clonedTask,
            actorId: userId,
          });

          this.aiService.embedEntity(
            result.clonedTask.id,
            'Task',
            `${result.clonedTask.title}\n${result.clonedTask.description || ''}`,
          );

          // Return here to avoid double update
          this.activityService.recordActivity({
            workspaceId,
            projectId: result.updatedOriginal.projectId || undefined,
            userId,
            entityType: 'TASK',
            entityId: result.updatedOriginal.id,
            action: 'COMPLETED',
            metadata: { title: result.updatedOriginal.title },
          });

          this.realtimeService.broadcast({
            workspaceId,
            projectId: result.updatedOriginal.projectId || undefined,
            event: 'task.completed',
            payload: result.updatedOriginal,
            actorId: userId,
          });

          return result.updatedOriginal;
        }
      } catch (err) {
        console.error('Failed to parse RRULE', err);
        // Fallthrough to normal update
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        completedAt,
        assignees: assigneeIds
          ? {
              deleteMany: {},
              create: assigneeIds.map((userId) => ({ userId })),
            }
          : undefined,
      },
      include: {
        assignees: true,
      },
    });

    if (updatedTask.status === 'DONE' && existingTask.status !== 'DONE') {
      this.activityService.recordActivity({
        workspaceId,
        projectId: updatedTask.projectId || undefined,
        userId: existingTask.creatorId,
        entityType: 'TASK',
        entityId: updatedTask.id,
        action: 'COMPLETED',
        metadata: { title: updatedTask.title },
      });
    } else {
      this.activityService.recordActivity({
        workspaceId,
        projectId: updatedTask.projectId || undefined,
        userId: existingTask.creatorId,
        entityType: 'TASK',
        entityId: updatedTask.id,
        action: 'UPDATED',
        metadata: { title: updatedTask.title },
      });
    }

    // Fire & forget embedding generation
    this.aiService.embedEntity(
      updatedTask.id,
      'Task',
      `${updatedTask.title}\n${updatedTask.description || ''}`,
    );

    this.realtimeService.broadcast({
      workspaceId,
      projectId: updatedTask.projectId || undefined,
      event:
        updatedTask.status === 'DONE' && existingTask.status !== 'DONE'
          ? 'task.completed'
          : 'task.updated',
      payload: updatedTask,
      actorId: userId,
    });

    return updatedTask;
  }

  async remove(workspaceId: string, userId: string, id: string) {
    const task = await this.findOne(workspaceId, userId, id); // Ensure it exists and VIEWER

    if (task.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        task.projectId,
        userId,
        'EDITOR',
      );
    } else {
      await this.permissionsService.requireWorkspaceRole(workspaceId, userId, 'MEMBER');
    }

    const deletedTask = await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: deletedTask.projectId || undefined,
      userId: deletedTask.creatorId,
      entityType: 'TASK',
      entityId: deletedTask.id,
      action: 'DELETED',
      metadata: { title: deletedTask.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: deletedTask.projectId || undefined,
      event: 'task.deleted',
      payload: deletedTask,
      actorId: userId,
    });

    return deletedTask;
  }
}
