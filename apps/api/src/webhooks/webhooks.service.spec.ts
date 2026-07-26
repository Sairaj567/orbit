import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from './webhooks.service';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            workspace: {
              update: jest.fn(),
            },
            workspaceMember: {
              update: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            taskAssignee: {
              deleteMany: jest.fn(),
            },
            task: {
              updateMany: jest.fn(),
              deleteMany: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('handleUserDeleted', () => {
    it('returns early without database query when payload is missing clerk id', async () => {
      await service.handleUserDeleted({});

      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('returns early without deleting user when local user record is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await service.handleUserDeleted({ id: 'clerk_nonexistent' });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_nonexistent' },
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
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('soft-deletes workspace when deleting user is sole member', async () => {
      const deletingUserId = 'usr_sole';
      const user = {
        id: deletingUserId,
        clerkId: 'c_sole',
        deletedAt: null,
        memberships: [
          {
            id: 'wm_1',
            role: 'OWNER',
            workspaceId: 'ws_sole',
            workspace: {
              id: 'ws_sole',
              members: [{ id: 'wm_1', userId: deletingUserId }],
            },
          },
        ],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (prismaService.task.findMany as jest.Mock).mockResolvedValueOnce([]);

      await service.handleUserDeleted({ id: 'c_sole' });

      expect(prismaService.workspace.update).toHaveBeenCalledWith({
        where: { id: 'ws_sole' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('transfers ownership to single remaining active member when owner is deleted', async () => {
      const deletingUserId = 'usr_owner';
      const user = {
        id: deletingUserId,
        clerkId: 'c_owner',
        deletedAt: null,
        memberships: [
          {
            id: 'wm_owner',
            role: 'OWNER',
            workspaceId: 'ws_multi',
            workspace: {
              id: 'ws_multi',
              members: [
                {
                  id: 'wm_owner',
                  userId: deletingUserId,
                  role: 'OWNER',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-01'),
                },
                {
                  id: 'wm_member',
                  userId: 'usr_member',
                  role: 'MEMBER',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-02'),
                },
              ],
            },
          },
        ],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (prismaService.task.findMany as jest.Mock).mockResolvedValueOnce([]);

      await service.handleUserDeleted({ id: 'c_owner' });

      expect(prismaService.workspaceMember.update).toHaveBeenCalledWith({
        where: { id: 'wm_member' },
        data: { role: 'OWNER' },
      });
      expect(prismaService.task.updateMany).toHaveBeenCalledWith({
        where: { creatorId: deletingUserId, workspaceId: 'ws_multi' },
        data: { creatorId: 'usr_member' },
      });
    });

    it('transfers ownership to higher role rank member when multiple members exist', async () => {
      const deletingUserId = 'usr_owner';
      const user = {
        id: deletingUserId,
        clerkId: 'c_owner',
        deletedAt: null,
        memberships: [
          {
            id: 'wm_owner',
            role: 'OWNER',
            workspaceId: 'ws_rank',
            workspace: {
              id: 'ws_rank',
              members: [
                {
                  id: 'wm_owner',
                  userId: deletingUserId,
                  role: 'OWNER',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-01'),
                },
                {
                  id: 'wm_viewer',
                  userId: 'usr_viewer',
                  role: 'VIEWER',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-01'),
                },
                {
                  id: 'wm_admin',
                  userId: 'usr_admin',
                  role: 'ADMIN',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-05'),
                },
              ],
            },
          },
        ],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (prismaService.task.findMany as jest.Mock).mockResolvedValueOnce([]);

      await service.handleUserDeleted({ id: 'c_owner' });

      expect(prismaService.workspaceMember.update).toHaveBeenCalledWith({
        where: { id: 'wm_admin' },
        data: { role: 'OWNER' },
      });
    });

    it('breaks role rank ties using joinedAt timestamp (earliest member wins)', async () => {
      const deletingUserId = 'usr_owner';
      const user = {
        id: deletingUserId,
        clerkId: 'c_owner',
        deletedAt: null,
        memberships: [
          {
            id: 'wm_owner',
            role: 'OWNER',
            workspaceId: 'ws_tie',
            workspace: {
              id: 'ws_tie',
              members: [
                {
                  id: 'wm_owner',
                  userId: deletingUserId,
                  role: 'OWNER',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-01'),
                },
                {
                  id: 'wm_admin_late',
                  userId: 'usr_admin_late',
                  role: 'ADMIN',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-10'),
                },
                {
                  id: 'wm_admin_early',
                  userId: 'usr_admin_early',
                  role: 'ADMIN',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-02'),
                },
              ],
            },
          },
        ],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (prismaService.task.findMany as jest.Mock).mockResolvedValueOnce([]);

      await service.handleUserDeleted({ id: 'c_owner' });

      expect(prismaService.workspaceMember.update).toHaveBeenCalledWith({
        where: { id: 'wm_admin_early' },
        data: { role: 'OWNER' },
      });
    });

    it('reassigns created tasks to workspace owner when deleting user is non-owner member', async () => {
      const deletingUserId = 'usr_member';
      const user = {
        id: deletingUserId,
        clerkId: 'c_member',
        deletedAt: null,
        memberships: [
          {
            id: 'wm_member',
            role: 'MEMBER',
            workspaceId: 'ws_member_del',
            workspace: {
              id: 'ws_member_del',
              members: [
                {
                  id: 'wm_owner',
                  userId: 'usr_owner',
                  role: 'OWNER',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-01'),
                },
                {
                  id: 'wm_member',
                  userId: deletingUserId,
                  role: 'MEMBER',
                  status: 'ACTIVE',
                  joinedAt: new Date('2026-01-02'),
                },
              ],
            },
          },
        ],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (prismaService.task.findMany as jest.Mock).mockResolvedValueOnce([]);

      await service.handleUserDeleted({ id: 'c_member' });

      expect(prismaService.task.updateMany).toHaveBeenCalledWith({
        where: { creatorId: deletingUserId, workspaceId: 'ws_member_del' },
        data: { creatorId: 'usr_owner' },
      });
    });

    it('reassigns tasks created in workspaces user is no longer a member of to workspace owner', async () => {
      const deletingUserId = 'usr_non_member_creator';
      const user = {
        id: deletingUserId,
        clerkId: 'c_non_member',
        deletedAt: null,
        memberships: [],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (prismaService.task.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'task_orphan_1', workspaceId: 'ws_other' },
      ]);
      (prismaService.workspaceMember.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 'wm_other_owner',
          userId: 'usr_other_owner',
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date('2026-01-01'),
        },
      ]);

      await service.handleUserDeleted({ id: 'c_non_member' });

      expect(prismaService.task.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['task_orphan_1'] } },
        data: { creatorId: 'usr_other_owner' },
      });
    });

    it('soft-deletes genuinely orphaned tasks in empty workspace with warning log', async () => {
      const deletingUserId = 'usr_1';
      const user = {
        id: deletingUserId,
        clerkId: 'c_1',
        deletedAt: null,
        memberships: [],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (prismaService.task.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'task_orphan_1', workspaceId: 'ws_empty' },
      ]);
      (prismaService.workspaceMember.findMany as jest.Mock).mockResolvedValueOnce([]);

      await service.handleUserDeleted({ id: 'c_1' });

      expect(prismaService.task.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['task_orphan_1'] } },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('deletes TaskAssignee, WorkspaceMember records, and soft-deletes local User record as final cleanup', async () => {
      const deletingUserId = 'usr_1';
      const user = {
        id: deletingUserId,
        clerkId: 'c_1',
        deletedAt: null,
        memberships: [],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(user);
      (prismaService.task.findMany as jest.Mock).mockResolvedValueOnce([]);

      await service.handleUserDeleted({ id: 'c_1' });

      expect(prismaService.taskAssignee.deleteMany).toHaveBeenCalledWith({
        where: { userId: deletingUserId },
      });
      expect(prismaService.workspaceMember.deleteMany).toHaveBeenCalledWith({
        where: { userId: deletingUserId },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: deletingUserId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
