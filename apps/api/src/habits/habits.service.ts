import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateHabitInput, UpdateHabitInput } from '@orbit/shared';
import { ActivityService } from '../activity/activity.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { computeStreak } from './recalculate-streak';

@Injectable()
export class HabitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly realtimeService: RealtimeService,
    private readonly permissionsService: ProjectPermissionsService,
  ) {}

  async create(workspaceId: string, userId: string, data: CreateHabitInput) {
    await this.permissionsService.requireProjectRole(workspaceId, data.projectId, userId, 'EDITOR');

    const habit = await this.prisma.habit.create({
      data: {
        workspaceId,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        color: data.color,
        icon: data.icon,
        rrule: data.rrule,
        timezone: data.timezone,
        recurrenceType: data.recurrenceType,
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: habit.projectId,
      userId,
      entityType: 'HABIT',
      entityId: habit.id,
      action: 'CREATED',
      metadata: { title: habit.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: habit.projectId,
      event: 'habit.created',
      payload: habit,
      actorId: userId,
    });

    return habit;
  }

  async findAll(workspaceId: string, userId: string, projectId?: string) {
    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });
    if (!workspaceMember) throw new NotFoundException();

    if (projectId) {
      await this.permissionsService.requireProjectRole(workspaceId, projectId, userId, 'VIEWER');
    }

    const where: Prisma.HabitWhereInput = {
      workspaceId,
      ...(projectId
        ? { projectId }
        : {
            project: { members: { some: { workspaceMemberId: workspaceMember.id } } },
          }),
    };

    return this.prisma.habit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(workspaceId: string, userId: string, id: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id, workspaceId },
    });

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    await this.permissionsService.requireProjectRole(
      workspaceId,
      habit.projectId,
      userId,
      'VIEWER',
    );

    return habit;
  }

  async getHistory(workspaceId: string, userId: string, id: string) {
    const habit = await this.findOne(workspaceId, userId, id);
    const completions = await this.prisma.habitCompletion.findMany({
      where: { habitId: id },
      orderBy: { completedAt: 'desc' },
      take: 60,
    });
    return { habit, completions };
  }

  async update(workspaceId: string, userId: string, id: string, data: UpdateHabitInput) {
    const existingHabit = await this.findOne(workspaceId, userId, id);
    await this.permissionsService.requireProjectRole(
      workspaceId,
      existingHabit.projectId,
      userId,
      'EDITOR',
    );

    if (data.projectId && data.projectId !== existingHabit.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        data.projectId,
        userId,
        'EDITOR',
      );
    }

    const habit = await this.prisma.habit.update({
      where: { id },
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        color: data.color,
        icon: data.icon,
        rrule: data.rrule,
        timezone: data.timezone,
        recurrenceType: data.recurrenceType,
        archived: data.archived,
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: habit.projectId,
      userId,
      entityType: 'HABIT',
      entityId: habit.id,
      action: 'UPDATED',
      metadata: { title: habit.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: habit.projectId,
      event: 'habit.updated',
      payload: habit,
      actorId: userId,
    });

    return habit;
  }

  async remove(workspaceId: string, userId: string, id: string) {
    const existingHabit = await this.findOne(workspaceId, userId, id);
    await this.permissionsService.requireProjectRole(
      workspaceId,
      existingHabit.projectId,
      userId,
      'EDITOR',
    );

    await this.prisma.habit.delete({
      where: { id },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: existingHabit.projectId,
      userId,
      entityType: 'HABIT',
      entityId: id,
      action: 'DELETED',
      metadata: { title: existingHabit.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: existingHabit.projectId,
      event: 'habit.deleted',
      payload: { id },
      actorId: userId,
    });

    return { success: true };
  }

  async toggleComplete(workspaceId: string, userId: string, id: string) {
    const existingHabit = await this.findOne(workspaceId, userId, id);
    await this.permissionsService.requireProjectRole(
      workspaceId,
      existingHabit.projectId,
      userId,
      'EDITOR',
    );

    const tz = existingHabit.timezone || 'UTC';
    const now = new Date();

    const zonedNow = toZonedTime(now, tz);

    // Calculate start and end of the day in the target timezone
    const zonedStart = new Date(
      zonedNow.getFullYear(),
      zonedNow.getMonth(),
      zonedNow.getDate(),
      0,
      0,
      0,
      0,
    );
    const zonedEnd = new Date(
      zonedNow.getFullYear(),
      zonedNow.getMonth(),
      zonedNow.getDate(),
      23,
      59,
      59,
      999,
    );

    // Convert back to UTC
    const todayStart = fromZonedTime(zonedStart, tz);
    const todayEnd = fromZonedTime(zonedEnd, tz);

    const existingCompletion = await this.prisma.habitCompletion.findFirst({
      where: {
        habitId: id,
        completedAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });

    let action: 'COMPLETED' | 'UNCOMPLETED';

    if (existingCompletion) {
      // Un-complete
      await this.prisma.habitCompletion.delete({
        where: { id: existingCompletion.id },
      });
      action = 'UNCOMPLETED';
    } else {
      // Complete
      await this.prisma.habitCompletion.create({
        data: {
          habitId: id,
          completedAt: now,
        },
      });
      action = 'COMPLETED';
    }

    return this.recalculateStreak(workspaceId, userId, id, action);
  }

  async recalculateStreak(
    workspaceId: string,
    userId: string,
    habitId: string,
    action: 'COMPLETED' | 'UNCOMPLETED' | 'CREATED' | 'UPDATED' | 'DELETED',
  ) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      include: { completions: { orderBy: { completedAt: 'asc' } } },
    });

    if (!habit) throw new NotFoundException();

    const { streak, longestStreak } = computeStreak(
      habit.completions,
      habit.rrule,
      habit.timezone || 'UTC',
    );

    const completionCount = habit.completions.length;
    const lastCompletedAt =
      completionCount > 0 ? (habit.completions[completionCount - 1]?.completedAt ?? null) : null;

    const updatedHabit = await this.prisma.habit.update({
      where: { id: habitId },
      data: {
        streak,
        longestStreak,
        completionCount,
        lastCompletedAt,
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: updatedHabit.projectId,
      userId,
      entityType: 'HABIT',
      entityId: updatedHabit.id,
      action: action,
      metadata: { title: updatedHabit.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: updatedHabit.projectId,
      event: 'habit.updated',
      payload: updatedHabit,
      actorId: userId,
    });

    return updatedHabit;
  }
}
