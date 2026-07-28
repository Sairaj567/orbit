import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { envelope } from '@orbit/shared';
import type { CreateResourceInput, UpdateResourceInput, ResourceQueryInput } from '@orbit/shared';
import { ActivityService } from '../activity/activity.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';
import { ResourceType } from '@prisma/client';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly realtimeService: RealtimeService,
    private readonly permissionsService: ProjectPermissionsService,
    private readonly aiService: AiService,
  ) {}

  private detectResourceType(url?: string | null) {
    if (!url) return 'MARKDOWN';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('github.com')) return 'GITHUB';
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'YOUTUBE';
    if (lowerUrl.endsWith('.pdf')) return 'PDF';
    return 'WEBSITE';
  }

  private extractTitle(url?: string | null) {
    if (!url) return 'Untitled Resource';
    try {
      const parsedUrl = new URL(url);
      const title = `${parsedUrl.hostname}${parsedUrl.pathname !== '/' ? parsedUrl.pathname : ''}`;
      // Basic formatting to make it look a bit better
      return title.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  async create(workspaceId: string, userId: string, data: CreateResourceInput) {
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
      const targetProjectId = data.projectId !== undefined ? data.projectId : null;
      if (
        !task ||
        task.workspaceId !== workspaceId ||
        (targetProjectId && task.projectId !== targetProjectId)
      ) {
        throw new NotFoundException('Task not found or does not belong to this project');
      }
    }

    const type = data.type || this.detectResourceType(data.url);
    const title = data.title || this.extractTitle(data.url);

    const resource = await this.prisma.resource.create({
      data: {
        workspaceId,
        title,
        url: data.url,
        type: type as ResourceType,
        metadata: data.metadata || {},
        projectId: data.projectId,
        taskId: data.taskId,
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: resource.projectId || undefined,
      userId,
      entityType: 'RESOURCE',
      entityId: resource.id,
      action: 'CREATED',
      metadata: { title: resource.title, type: resource.type },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: resource.projectId || undefined,
      event: 'resource.created',
      payload: resource,
      actorId: userId,
    });

    const description = (resource.metadata as Record<string, unknown>)?.description || '';
    this.aiService.embedEntity(
      resource.id,
      'Resource',
      `${resource.title}\n${resource.url || ''}\n${description}`,
    );

    return resource;
  }

  async findAll(workspaceId: string, userId: string, query: ResourceQueryInput) {
    const { page, perPage, sortBy, sortOrder, projectId, taskId } = query;
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
      ...(!projectId && {
        OR: [
          { projectId: null },
          { project: { members: { some: { workspaceMemberId: workspaceMember.id } } } },
        ],
      }),
      ...(projectId && { projectId }),
      ...(taskId && { taskId }),
    };

    const [total, resources] = await Promise.all([
      this.prisma.resource.count({ where }),
      this.prisma.resource.findMany({
        where,
        skip,
        take: perPage,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
    ]);

    return envelope(resources, {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  }

  async findOne(workspaceId: string, userId: string, id: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { id, workspaceId },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    if (resource.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        resource.projectId,
        userId,
        'VIEWER',
      );
    }

    return resource;
  }

  async update(workspaceId: string, userId: string, id: string, data: UpdateResourceInput) {
    const resource = await this.findOne(workspaceId, userId, id); // Ensure it exists

    if (resource.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        resource.projectId,
        userId,
        'EDITOR',
      );
    } else {
      await this.permissionsService.requireWorkspaceRole(workspaceId, userId, 'MEMBER');
    }

    if (data.projectId !== undefined && data.projectId !== resource.projectId) {
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

    const updatedResource = await this.prisma.resource.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.metadata !== undefined && { metadata: data.metadata || {} }),
        ...(data.projectId !== undefined && { projectId: data.projectId }),
        ...(data.taskId !== undefined && { taskId: data.taskId }),
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: updatedResource.projectId || undefined,
      userId,
      entityType: 'RESOURCE',
      entityId: updatedResource.id,
      action: 'UPDATED',
      metadata: { title: updatedResource.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: updatedResource.projectId || undefined,
      event: 'resource.updated',
      payload: updatedResource,
      actorId: userId,
    });

    const description = (updatedResource.metadata as Record<string, unknown>)?.description || '';
    this.aiService.embedEntity(
      updatedResource.id,
      'Resource',
      `${updatedResource.title}\n${updatedResource.url || ''}\n${description}`,
    );

    return updatedResource;
  }

  async remove(workspaceId: string, userId: string, id: string) {
    const resource = await this.findOne(workspaceId, userId, id); // Ensure it exists

    if (resource.projectId) {
      await this.permissionsService.requireProjectRole(
        workspaceId,
        resource.projectId,
        userId,
        'EDITOR',
      );
    } else {
      await this.permissionsService.requireWorkspaceRole(workspaceId, userId, 'MEMBER');
    }

    const deletedResource = await this.prisma.resource.delete({
      where: { id },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: deletedResource.projectId || undefined,
      userId,
      entityType: 'RESOURCE',
      entityId: deletedResource.id,
      action: 'DELETED',
      metadata: { title: deletedResource.title },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: deletedResource.projectId || undefined,
      event: 'resource.deleted',
      payload: { id: deletedResource.id },
      actorId: userId,
    });

    return deletedResource;
  }
}
