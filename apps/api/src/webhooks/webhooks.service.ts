import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ROLE_RANK: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleUserCreatedOrUpdated(data: Record<string, unknown>) {
    const clerkId = data.id as string;
    if (!clerkId) return;

    const emailAddresses = data.email_addresses as Array<{ email_address?: string }> | undefined;
    const email = emailAddresses?.[0]?.email_address || `${clerkId}@clerk.user`;
    const firstName = (data.first_name as string) || '';
    const lastName = (data.last_name as string) || '';
    const displayName = `${firstName} ${lastName}`.trim() || (data.username as string) || email;
    const avatarUrl = (data.image_url as string) || null;

    this.logger.log(`Syncing user from webhook for Clerk ID: ${clerkId}`);

    await this.prisma.user.upsert({
      where: { clerkId },
      update: {
        email,
        displayName,
        avatarUrl,
        deletedAt: null,
      },
      create: {
        clerkId,
        email,
        displayName,
        avatarUrl,
      },
    });
  }

  async handleUserDeleted(data: Record<string, unknown>) {
    const clerkId = data.id as string;
    if (!clerkId) return;

    this.logger.log(`Processing user deletion for Clerk ID: ${clerkId}`);

    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        memberships: {
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      this.logger.warn(`User with Clerk ID ${clerkId} not found or already deleted.`);
      return;
    }

    const deletingUserId = user.id;

    for (const membership of user.memberships) {
      const workspace = membership.workspace;
      if (!workspace) continue;

      const activeMembers = workspace.members.filter((m) => m.status === 'ACTIVE');
      const isSoleMember = activeMembers.length <= 1;

      if (isSoleMember) {
        this.logger.log(
          `Soft-deleting sole-member workspace ${workspace.id} during user deletion.`,
        );
        await this.prisma.workspace.update({
          where: { id: workspace.id },
          data: { deletedAt: new Date() },
        });
        await this.prisma.task.updateMany({
          where: { workspaceId: workspace.id, deletedAt: null },
          data: { deletedAt: new Date() },
        });
      } else if (membership.role === 'OWNER') {
        const remainingMembers = activeMembers.filter(
          (m) => m.userId && m.userId !== deletingUserId,
        );

        if (remainingMembers.length > 0) {
          // Sort remaining members by role rank desc, then joinedAt asc
          remainingMembers.sort((a, b) => {
            const rankA = ROLE_RANK[a.role] || 0;
            const rankB = ROLE_RANK[b.role] || 0;
            if (rankA !== rankB) return rankB - rankA;
            return a.joinedAt.getTime() - b.joinedAt.getTime();
          });

          const targetOwner = remainingMembers[0];
          if (targetOwner) {
            this.logger.log(
              `Transferring ownership of workspace ${workspace.id} to user ${targetOwner.userId}`,
            );

            await this.prisma.workspaceMember.update({
              where: { id: targetOwner.id },
              data: { role: 'OWNER' },
            });

            if (targetOwner.userId) {
              await this.prisma.task.updateMany({
                where: { creatorId: deletingUserId, workspaceId: workspace.id },
                data: { creatorId: targetOwner.userId },
              });
            }
          }
        }
      } else {
        // Deleting user is not owner, reassign their created tasks in this workspace to the workspace owner
        const ownerMember = activeMembers.find(
          (m) => m.role === 'OWNER' && m.userId && m.userId !== deletingUserId,
        );
        if (ownerMember?.userId) {
          await this.prisma.task.updateMany({
            where: { creatorId: deletingUserId, workspaceId: workspace.id },
            data: { creatorId: ownerMember.userId },
          });
        }
      }
    }

    // Reassign tasks created in workspaces the user is no longer a member of
    const remainingTasks = await this.prisma.task.findMany({
      where: { creatorId: deletingUserId },
      select: { id: true, workspaceId: true },
    });

    if (remainingTasks.length > 0) {
      const tasksByWorkspace = new Map<string, string[]>();
      for (const task of remainingTasks) {
        const list = tasksByWorkspace.get(task.workspaceId) || [];
        list.push(task.id);
        tasksByWorkspace.set(task.workspaceId, list);
      }

      for (const [workspaceId, taskIds] of tasksByWorkspace.entries()) {
        const activeMembers = await this.prisma.workspaceMember.findMany({
          where: { workspaceId, status: 'ACTIVE', userId: { not: null } },
        });

        const availableMembers = activeMembers.filter(
          (m) => m.userId && m.userId !== deletingUserId,
        );

        if (availableMembers.length > 0) {
          availableMembers.sort((a, b) => {
            const rankA = ROLE_RANK[a.role] || 0;
            const rankB = ROLE_RANK[b.role] || 0;
            if (rankA !== rankB) return rankB - rankA;
            return a.joinedAt.getTime() - b.joinedAt.getTime();
          });

          const targetMember = availableMembers[0];
          if (targetMember?.userId) {
            this.logger.log(
              `Reassigning ${taskIds.length} tasks in non-member workspace ${workspaceId} to user ${targetMember.userId}`,
            );
            await this.prisma.task.updateMany({
              where: { id: { in: taskIds } },
              data: { creatorId: targetMember.userId },
            });
          }
        } else {
          // Genuinely empty workspace: soft-delete tasks
          this.logger.warn(
            `Soft-deleting ${taskIds.length} orphaned tasks (IDs: ${taskIds.join(', ')}) in empty workspace ${workspaceId}`,
          );
          await this.prisma.task.updateMany({
            where: { id: { in: taskIds } },
            data: { deletedAt: new Date() },
          });
        }
      }
    }

    // Delete TaskAssignee records for soft-deleted user (explicit application-level cleanup)
    await this.prisma.taskAssignee.deleteMany({
      where: { userId: deletingUserId },
    });

    // Delete WorkspaceMember records for soft-deleted user
    await this.prisma.workspaceMember.deleteMany({
      where: { userId: deletingUserId },
    });

    // Soft-delete local User record
    await this.prisma.user.update({
      where: { id: deletingUserId },
      data: { deletedAt: new Date() },
    });

    this.logger.log(
      `Successfully completed soft-deletion for user ${deletingUserId} (Clerk ID: ${clerkId}).`,
    );
  }
}
