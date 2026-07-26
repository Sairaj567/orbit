import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { envelope, CreateWorkspaceInput, UpdateWorkspaceInput } from '@orbit/shared';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateWorkspaceInput) {
    try {
      const workspace = await this.prisma.$transaction(async (tx) => {
        const createdWorkspace = await tx.workspace.create({
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            avatarUrl: data.avatarUrl,
          },
        });

        await tx.workspaceMember.create({
          data: {
            workspaceId: createdWorkspace.id,
            userId,
            role: 'OWNER',
            status: 'ACTIVE',
          },
        });

        return createdWorkspace;
      });

      return envelope(workspace);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Workspace slug is already taken');
      }
      throw error;
    }
  }

  async findAllForUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        workspace: {
          deletedAt: null,
        },
      },
      include: {
        workspace: true,
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    const workspaces = memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));

    return envelope(workspaces);
  }

  async update(workspaceId: string, data: UpdateWorkspaceInput) {
    try {
      const updatedWorkspace = await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.slug && { slug: data.slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        },
      });

      return envelope(updatedWorkspace);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Workspace slug is already taken');
      }
      throw error;
    }
  }
}
