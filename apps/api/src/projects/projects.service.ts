import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectInput, UpdateProjectInput, ProjectQueryInput, envelope } from '@orbit/shared';
import { Prisma } from '@prisma/client';

import { ActivityService } from '../activity/activity.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly realtimeService: RealtimeService,
    private readonly permissionsService: ProjectPermissionsService,
  ) {}

  async create(data: CreateProjectInput, userId: string, workspaceId: string) {
    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });

    if (!workspaceMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const project = await this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        coverImage: data.coverImage,
        status: data.status,
        visibility: data.visibility,
        workspaceId,
        creatorId: userId,
        members: {
          create: {
            workspaceMemberId: workspaceMember.id,
            role: 'OWNER',
          },
        },
      },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: project.id,
      userId: userId,
      entityType: 'PROJECT',
      entityId: project.id,
      action: 'CREATED',
      metadata: { title: project.name },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: project.id,
      event: 'project.created',
      payload: project,
      actorId: userId,
    });

    return project;
  }

  async findAll(workspaceId: string, userId: string, query: ProjectQueryInput) {
    const { page = 1, perPage = 20, status, visibility, isArchived, search } = query;
    const skip = (page - 1) * perPage;

    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: 'ACTIVE' },
    });
    if (!workspaceMember) throw new ForbiddenException();

    const where: Prisma.ProjectWhereInput = {
      workspaceId,
      OR: [
        { visibility: 'WORKSPACE' },
        { members: { some: { workspaceMemberId: workspaceMember.id } } },
      ],
    };

    if (status) where.status = status;
    if (visibility) where.visibility = visibility;
    if (isArchived !== undefined) where.isArchived = isArchived;
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { order: 'asc' }, // By default order by custom order
      }),
      this.prisma.project.count({ where }),
    ]);

    return envelope(items, {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  }

  async findOne(id: string, workspaceId: string, userId: string) {
    await this.permissionsService.requireProjectRole(workspaceId, id, userId, 'VIEWER');

    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            workspaceMember: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!project || project.workspaceId !== workspaceId) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, workspaceId: string, userId: string, data: UpdateProjectInput) {
    await this.permissionsService.requireProjectRole(workspaceId, id, userId, 'EDITOR');
    const project = await this.findOne(id, workspaceId, userId);

    const updatedProject = await this.prisma.project.update({
      where: { id: project.id },
      data,
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: updatedProject.id,
      userId,
      entityType: 'PROJECT',
      entityId: updatedProject.id,
      action: 'UPDATED',
      metadata: { title: updatedProject.name },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: updatedProject.id,
      event: 'project.updated',
      payload: updatedProject,
    });

    return updatedProject;
  }

  async remove(id: string, workspaceId: string, userId: string) {
    await this.permissionsService.requireProjectRole(workspaceId, id, userId, 'OWNER');
    const project = await this.findOne(id, workspaceId, userId);

    const deletedProject = await this.prisma.project.update({
      where: { id: project.id },
      data: { isArchived: true, deletedAt: new Date() },
    });

    this.activityService.recordActivity({
      workspaceId,
      projectId: deletedProject.id,
      userId,
      entityType: 'PROJECT',
      entityId: deletedProject.id,
      action: 'DELETED',
      metadata: { title: deletedProject.name },
    });

    this.realtimeService.broadcast({
      workspaceId,
      projectId: deletedProject.id,
      event: 'project.deleted',
      payload: { id },
    });

    return deletedProject;
  }
}
