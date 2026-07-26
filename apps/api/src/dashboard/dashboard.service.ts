import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { DashboardResponse } from '@orbit/shared';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async getDashboardData(workspaceId: string, userId: string): Promise<DashboardResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Fetch Today's Tasks (Due today or previously, not done)
    const activeTasks = await this.prisma.task.findMany({
      where: {
        workspaceId,
        assignees: { some: { userId } },
        status: { notIn: ['DONE', 'CANCELLED', 'SKIPPED'] },
        dueDate: { not: null },
      },
      include: {
        assignees: { include: { user: true } },
        category: true,
      },
    });

    const tasks = activeTasks.filter(
      (t) => t.dueDate && t.dueDate >= today && t.dueDate <= endOfToday,
    );
    const overdueTasks = activeTasks.filter((t) => t.dueDate && t.dueDate < today);

    // Fetch Habits
    const habits = await this.prisma.habit.findMany({
      where: { workspaceId },
    });

    // Active Study Block
    const activeStudyBlock = await this.prisma.studyBlock.findFirst({
      where: {
        workspaceId,
        userId,
        status: 'RUNNING',
      },
      include: {
        task: true,
        habit: true,
        project: true,
      },
    });

    // Focus Time Today
    const todayStudyBlocks = await this.prisma.studyBlock.findMany({
      where: {
        workspaceId,
        userId,
        status: 'COMPLETED',
        endedAt: { gte: today, lte: endOfToday },
      },
    });
    const focusTimeToday = todayStudyBlocks.reduce(
      (acc, block) => acc + (block.actualDuration || 0),
      0,
    );

    // Focus Time Weekly
    const weeklyStudyBlocks = await this.prisma.studyBlock.findMany({
      where: {
        workspaceId,
        userId,
        status: 'COMPLETED',
        endedAt: { gte: startOfWeek, lte: endOfToday },
      },
    });
    const weeklyFocusMinutes = weeklyStudyBlocks.reduce(
      (acc, block) => acc + (block.actualDuration || 0),
      0,
    );
    const weeklyFocusHours = Number((weeklyFocusMinutes / 60).toFixed(1));

    // Tasks completed today
    const tasksCompletedToday = await this.prisma.task.count({
      where: {
        workspaceId,
        assignees: { some: { userId } },
        status: 'DONE',
        updatedAt: { gte: today, lte: endOfToday }, // approximate
      },
    });

    // Habit stats
    const habitsCompletedToday = habits.filter(
      (h) => h.lastCompletedAt && h.lastCompletedAt >= today && h.lastCompletedAt <= endOfToday,
    ).length;
    const habitCompletionPercent =
      habits.length > 0 ? Math.round((habitsCompletedToday / habits.length) * 100) : 0;
    const currentStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

    // Productivity Score Formula: 40% Tasks, 30% Habits, 20% Focus, 10% Consistency
    // Baseline: Tasks (5 = 100%), Habits (3 = 100%), Focus (120 mins = 100%), Streak (5 = 100%)
    const tasksScore = Math.min(tasksCompletedToday / 5, 1) * 40;
    const habitsScore = Math.min(habitsCompletedToday / 3, 1) * 30;
    const focusScore = Math.min(focusTimeToday / 120, 1) * 20;
    const consistencyScore = Math.min(currentStreak / 5, 1) * 10;
    const weeklyProductivityScore = Math.round(
      tasksScore + habitsScore + focusScore + consistencyScore,
    );

    // Recent Projects
    const recentProjects = await this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      include: {
        members: true,
      },
    });

    // We need task completion rate for projects
    // Just mock it or calculate it if possible. We can do a quick count.
    const projectIds = recentProjects.map((p) => p.id);
    const projectTaskStats = await this.prisma.task.groupBy({
      by: ['projectId', 'status'],
      where: { projectId: { in: projectIds } },
      _count: true,
    });

    const mappedProjects = recentProjects.map((project) => {
      const stats = projectTaskStats.filter((s) => s.projectId === project.id);
      const totalTasks = stats.reduce((acc, curr) => acc + curr._count, 0);
      const doneTasks = stats.find((s) => s.status === 'DONE')?._count || 0;
      const taskCompletionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      return {
        ...project,
        taskCompletionRate,
        memberCount: project.members.length,
      };
    });

    // Activity
    const activityResult = await this.activityService.getWorkspaceActivity(workspaceId, userId, 10);

    return {
      today: {
        tasks,
        overdueTasks,
        habits,
        activeStudyBlock,
      },
      stats: {
        tasksCompletedToday,
        focusTimeToday,
        habitCompletionPercent,
        currentStreak,
        weeklyProductivityScore,
        weeklyFocusHours,
      },
      projects: mappedProjects,
      activity: activityResult.data,
    } as unknown as DashboardResponse;
  }
}
