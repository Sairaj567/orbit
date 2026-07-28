import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateNoteInput, UpdateNoteInput, NoteQueryInput } from '@orbit/shared';
import { ActivityService } from '../activity/activity.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly realtimeService: RealtimeService,
    private readonly permissionsService: ProjectPermissionsService,
    private readonly aiService: AiService,
  ) {}

  async create(workspaceId: string, userId: string, data: CreateNoteInput) {
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
    if (data.taskId) {
      const task = await this.prisma.task.findUnique({ where: { id: data.taskId } });
      if (!task || task.workspaceId !== workspaceId || task.projectId !== data.projectId) {
        throw new NotFoundException('Task not found or does not belong to this project');
      }
    }

    const note = await this.prisma.note.create({
      data: {
        workspaceId,
        title: data.title,
        content: data.content,
        isPinned: data.isPinned,
        projectId: data.projectId,
        taskId: data.taskId,
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: note.projectId,
      userId,
      entityType: 'NOTE',
      entityId: note.id,
      action: 'CREATED',
      metadata: { title: note.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: note.projectId || undefined,
      event: 'note.created',
      payload: note,
      actorId: userId,
    });

    // Fire & forget embedding generation
    this.aiService.embedEntity(note.id, 'Note', `${note.title}\n${note.content}`);

    return note;
  }

  async findAll(workspaceId: string, userId: string, query: NoteQueryInput) {
    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });
    if (!workspaceMember) throw new NotFoundException();

    if (query.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        query.projectId,
        userId,
        'VIEWER',
      );
    }

    const where: Prisma.NoteWhereInput = {
      workspaceId,
      ...(!query.projectId && {
        project: { members: { some: { workspaceMemberId: workspaceMember.id } } },
      }),
    };

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.taskId) {
      where.taskId = query.taskId;
    }

    if (query.isPinned !== undefined) {
      where.isPinned = String(query.isPinned) === 'true';
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.note.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { order: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(workspaceId: string, userId: string, id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id, workspaceId },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    if (note.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        note.projectId,
        userId,
        'VIEWER',
      );
    }

    return note;
  }

  async update(workspaceId: string, userId: string, id: string, data: UpdateNoteInput) {
    const note = await this.findOne(workspaceId, userId, id);

    if (note.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        note.projectId,
        userId,
        'EDITOR',
      );
    } else {
      await this.permissionsService.requireWorkspaceRole(workspaceId, userId, 'MEMBER');
    }

    if (data.projectId !== undefined && data.projectId !== note.projectId) {
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

    if (data.taskId) {
      const task = await this.prisma.task.findUnique({ where: { id: data.taskId } });
      const targetProjectId = data.projectId !== undefined ? data.projectId : note.projectId;
      if (!task || task.workspaceId !== workspaceId || task.projectId !== targetProjectId) {
        throw new NotFoundException('Task not found or does not belong to this project');
      }
    }

    const updatedNote = await this.prisma.note.update({
      where: { id, workspaceId },
      data: {
        title: data.title,
        content: data.content,
        isPinned: data.isPinned,
        order: data.order,
        projectId: data.projectId,
        taskId: data.taskId,
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: updatedNote.projectId,
      userId,
      entityType: 'NOTE',
      entityId: updatedNote.id,
      action: 'UPDATED',
      metadata: { title: updatedNote.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: note.projectId || undefined,
      event: 'note.updated',
      payload: updatedNote,
      actorId: userId,
    });

    // Fire & forget embedding generation
    this.aiService.embedEntity(
      updatedNote.id,
      'Note',
      `${updatedNote.title}\n${updatedNote.content}`,
    );

    return updatedNote;
  }

  async remove(workspaceId: string, userId: string, id: string) {
    const note = await this.findOne(workspaceId, userId, id);

    if (note.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        note.projectId,
        userId,
        'EDITOR',
      );
    } else {
      await this.permissionsService.requireWorkspaceRole(workspaceId, userId, 'MEMBER');
    }

    const deletedNote = await this.prisma.note.delete({
      where: { id, workspaceId },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: deletedNote.projectId,
      userId,
      entityType: 'NOTE',
      entityId: deletedNote.id,
      action: 'DELETED',
      metadata: { title: deletedNote.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: deletedNote.projectId || undefined,
      event: 'note.deleted',
      payload: { id: deletedNote.id },
      actorId: userId,
    });

    return deletedNote;
  }
}
