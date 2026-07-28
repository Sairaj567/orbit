import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { RegisterInput, LoginInput, ChangePasswordInput } from '@orbit/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async register(input: RegisterInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        displayName: input.displayName,
      },
    });

    await this.prisma.workspaceMember.updateMany({
      where: { email: input.email, status: 'PENDING', userId: null },
      data: { userId: user.id },
    });

    this.logger.log(`User registered: ${user.id}`);
    return this.createSession(user.id);
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked. Try again later.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, user.failedLoginAttempts);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed attempts on success
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    this.logger.log(`User logged in: ${user.id}`);
    return this.createSession(user.id);
  }

  private async handleFailedLogin(userId: string, currentAttempts: number) {
    const newAttempts = currentAttempts + 1;
    const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // Lock for 30 mins after 5 attempts

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: newAttempts,
        lockedUntil,
      },
    });

    if (lockedUntil) {
      this.logger.warn(`User ${userId} locked out due to multiple failed login attempts`);
    }
  }

  async logout(sessionToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (session && !session.revokedAt) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      this.logger.log(`Session revoked: ${session.id}`);
    }
  }

  async logoutAll(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    this.logger.log(`All sessions revoked for user: ${userId}`);
  }

  async validateSession(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    if (session.user.deletedAt) {
      return null;
    }

    return session;
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.currentPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const passwordHash = await argon2.hash(input.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all sessions on password change
    await this.logoutAll(userId);

    this.logger.log(`Password changed for user: ${userId}`);
  }

  private async createSession(userId: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const session = await this.prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return session;
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      this.logger.warn(`User ${userId} not found or already deleted.`);
      return;
    }

    const ROLE_RANK: Record<string, number> = {
      OWNER: 4,
      ADMIN: 3,
      MEMBER: 2,
      VIEWER: 1,
    };

    const deletingUserId = user.id;

    for (const membership of user.memberships) {
      const workspace = membership.workspace;
      if (!workspace) continue;

      const activeMembers = workspace.members.filter((m: any) => m.status === 'ACTIVE');
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
          (m: any) => m.userId && m.userId !== deletingUserId,
        );

        if (remainingMembers.length > 0) {
          // Sort remaining members by role rank desc, then joinedAt asc
          remainingMembers.sort((a: any, b: any) => {
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
          (m: any) => m.role === 'OWNER' && m.userId && m.userId !== deletingUserId,
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
          (m: any) => m.userId && m.userId !== deletingUserId,
        );

        if (availableMembers.length > 0) {
          availableMembers.sort((a: any, b: any) => {
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

    // Revoke all sessions
    await this.logoutAll(deletingUserId);

    // Soft-delete local User record
    await this.prisma.user.update({
      where: { id: deletingUserId },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Successfully completed soft-deletion for user ${deletingUserId}.`);
  }
}
