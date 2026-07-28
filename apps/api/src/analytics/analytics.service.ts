import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async generateDailySnapshot(workspaceId: string, userId: string, date: Date = new Date()) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch tasks completed today
    const tasksCompleted = await this.prisma.task.count({
      where: {
        workspaceId,
        assignees: { some: { userId } },
        status: 'DONE',
        updatedAt: { gte: today, lte: endOfToday },
      },
    });

    // Fetch Focus Time
    const studyBlocks = await this.prisma.studyBlock.findMany({
      where: {
        workspaceId,
        userId,
        status: 'COMPLETED',
        endedAt: { gte: today, lte: endOfToday },
      },
    });
    const focusTimeMinutes = studyBlocks.reduce(
      (acc, block) => acc + (block.actualDuration || 0),
      0,
    );

    // Fetch Habits
    const habits = await this.prisma.habit.findMany({
      where: { workspaceId },
    });
    const habitsCompleted = habits.filter(
      (h) => h.lastCompletedAt && h.lastCompletedAt >= today && h.lastCompletedAt <= endOfToday,
    ).length;
    const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

    // Productivity Score Formula
    const tasksScore = Math.min(tasksCompleted / 5, 1) * 40;
    const habitsScore = Math.min(habitsCompleted / 3, 1) * 30;
    const focusScore = Math.min(focusTimeMinutes / 120, 1) * 20;
    const consistencyScore = Math.min(maxStreak / 5, 1) * 10;
    const productivityScore = Math.round(tasksScore + habitsScore + focusScore + consistencyScore);

    const metrics = {
      tasksCompleted,
      focusTimeMinutes,
      habitsCompleted,
      maxStreak,
    };

    return this.prisma.analyticsSnapshot.upsert({
      where: {
        workspaceId_userId_date_period: {
          workspaceId,
          userId,
          date: today,
          period: 'DAILY',
        },
      },
      update: {
        productivityScore,
        metrics,
      },
      create: {
        workspaceId,
        userId,
        date: today,
        period: 'DAILY',
        productivityScore,
        metrics,
      },
    });
  }

  async getAnalytics(workspaceId: string, userId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = { workspaceId, userId, period: 'DAILY' };
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    return this.prisma.analyticsSnapshot.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });
  }
}
