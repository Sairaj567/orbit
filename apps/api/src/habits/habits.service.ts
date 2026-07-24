import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateHabitInput, UpdateHabitInput } from '@orbit/shared';
import { ActivityService } from '../activity/activity.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';
import { RRule } from 'rrule';

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
      ...(projectId ? { projectId } : {
        project: { members: { some: { workspaceMemberId: workspaceMember.id } } }
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

    await this.permissionsService.requireProjectRole(workspaceId, habit.projectId, userId, 'VIEWER');

    return habit;
  }

  async update(workspaceId: string, userId: string, id: string, data: UpdateHabitInput) {
    const existingHabit = await this.findOne(workspaceId, userId, id);
    await this.permissionsService.requireProjectRole(workspaceId, existingHabit.projectId, userId, 'EDITOR');

    if (data.projectId && data.projectId !== existingHabit.projectId) {
      await this.permissionsService.requireProjectRole(workspaceId, data.projectId, userId, 'EDITOR');
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
    await this.permissionsService.requireProjectRole(workspaceId, existingHabit.projectId, userId, 'EDITOR');

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
    await this.permissionsService.requireProjectRole(workspaceId, existingHabit.projectId, userId, 'EDITOR');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const existingCompletion = await this.prisma.habitCompletion.findFirst({
      where: {
        habitId: id,
        completedAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });

    let newStreak = existingHabit.streak;
    let newLongestStreak = existingHabit.longestStreak;
    let newCompletionCount = existingHabit.completionCount;
    let newLastCompletedAt = existingHabit.lastCompletedAt;

    if (existingCompletion) {
      // Un-complete
      await this.prisma.habitCompletion.delete({
        where: { id: existingCompletion.id },
      });
      newStreak = Math.max(0, existingHabit.streak - 1);
      newCompletionCount = Math.max(0, existingHabit.completionCount - 1);
      
      const previousCompletion = await this.prisma.habitCompletion.findFirst({
        where: { habitId: id },
        orderBy: { completedAt: 'desc' },
      });
      newLastCompletedAt = previousCompletion ? previousCompletion.completedAt : null;
    } else {
      // Complete
      await this.prisma.habitCompletion.create({
        data: {
          habitId: id,
          completedAt: now,
        },
      });
      
      newCompletionCount = existingHabit.completionCount + 1;
      newLastCompletedAt = now;

      // Basic Streak Calculation
      if (existingHabit.rrule) {
        try {
          const rule = RRule.fromString(existingHabit.rrule);
          const previousOccurrence = rule.before(now, false);
          
          if (existingHabit.lastCompletedAt && previousOccurrence) {
            // Check if last completion was on or after the previous occurrence
            if (existingHabit.lastCompletedAt >= previousOccurrence) {
              newStreak = existingHabit.streak + 1;
            } else {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }
        } catch {
          // Fallback if rrule parsing fails
          newStreak = existingHabit.streak + 1;
        }
      } else {
        newStreak = existingHabit.streak + 1;
      }
      
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
    }

    const updatedHabit = await this.prisma.habit.update({
      where: { id },
      data: {
        streak: newStreak,
        longestStreak: newLongestStreak,
        completionCount: newCompletionCount,
        lastCompletedAt: newLastCompletedAt,
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: updatedHabit.projectId,
      userId,
      entityType: 'HABIT',
      entityId: updatedHabit.id,
      action: existingCompletion ? 'UNCOMPLETED' : 'COMPLETED',
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
