import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalendarEvents(workspaceId: string, userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });

    if (!workspaceMember) {
      throw new NotFoundException('Workspace member not found');
    }

    // Get tasks due in range (accessible to user)
    const tasks = await this.prisma.task.findMany({
      where: {
        workspaceId,
        dueDate: {
          gte: start,
          lte: end,
        },
        OR: [
          { projectId: null },
          { project: { members: { some: { workspaceMemberId: workspaceMember.id } } } },
        ],
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
    });

    // Get habits (all active for workspace, frontend will expand rrule)
    const habits = await this.prisma.habit.findMany({
      where: {
        workspaceId,
        archived: false,
        OR: [{ project: { members: { some: { workspaceMemberId: workspaceMember.id } } } }],
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
    });

    // Get study blocks in range
    const studyBlocks = await this.prisma.studyBlock.findMany({
      where: {
        workspaceId,
        userId, // Study blocks are personal
        startedAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
    });

    return {
      tasks,
      habits,
      studyBlocks,
    };
  }
}
