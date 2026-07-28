import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskCommentInput, UpdateTaskCommentInput, envelope } from '@orbit/shared';

@Injectable()
export class TaskCommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, userId: string, taskId: string, input: CreateTaskCommentInput) {
    // Validate task exists and belongs to workspace
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, workspaceId },
      include: {
        project: {
          include: {
            members: { where: { workspaceMember: { userId } } },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Checking project access if task belongs to a project
    if (task.projectId && task.project && task.project.visibility !== 'WORKSPACE') {
      if (task.project.members.length === 0) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    const comment = await this.prisma.taskComment.create({
      data: {
        content: input.content,
        taskId,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });

    return envelope(comment);
  }

  async findAll(workspaceId: string, _userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, workspaceId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comments = await this.prisma.taskComment.findMany({
      where: { taskId, deletedAt: null },
      include: {
        author: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return envelope(comments);
  }

  async update(
    workspaceId: string,
    userId: string,
    taskId: string,
    commentId: string,
    input: UpdateTaskCommentInput,
  ) {
    const comment = await this.prisma.taskComment.findFirst({
      where: { id: commentId, taskId, deletedAt: null },
      include: { task: true },
    });

    if (!comment || comment.task.workspaceId !== workspaceId) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updated = await this.prisma.taskComment.update({
      where: { id: commentId },
      data: { content: input.content },
      include: {
        author: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });

    return envelope(updated);
  }

  async remove(workspaceId: string, userId: string, taskId: string, commentId: string) {
    const comment = await this.prisma.taskComment.findFirst({
      where: { id: commentId, taskId, deletedAt: null },
      include: { task: true },
    });

    if (!comment || comment.task.workspaceId !== workspaceId) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.taskComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return envelope({ success: true });
  }
}
