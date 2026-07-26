import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectPermissionsService } from './project-permissions.service';

describe('ProjectPermissionsService', () => {
  let service: ProjectPermissionsService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectPermissionsService,
        {
          provide: PrismaService,
          useValue: {
            workspaceMember: {
              findFirst: jest.fn(),
            },
            projectMember: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProjectPermissionsService>(ProjectPermissionsService);
    prismaService = module.get(PrismaService);
  });

  describe('requireWorkspaceRole', () => {
    it('allows access when user role rank meets minimum requirement', async () => {
      const workspaceMember = {
        id: 'wm_1',
        workspaceId: 'ws_1',
        userId: 'usr_1',
        role: 'ADMIN',
        status: 'ACTIVE',
      };
      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(workspaceMember);

      const result = await service.requireWorkspaceRole('ws_1', 'usr_1', 'MEMBER');
      expect(result).toEqual(workspaceMember);
    });

    it('blocks VIEWER user from action requiring MEMBER role', async () => {
      const workspaceMember = {
        id: 'wm_viewer',
        workspaceId: 'ws_1',
        userId: 'usr_viewer',
        role: 'VIEWER',
        status: 'ACTIVE',
      };
      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(workspaceMember);

      await expect(service.requireWorkspaceRole('ws_1', 'usr_viewer', 'MEMBER')).rejects.toThrow(
        new ForbiddenException('You need at least MEMBER workspace access'),
      );
    });

    it('blocks inactive workspace member', async () => {
      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.requireWorkspaceRole('ws_1', 'usr_inactive', 'VIEWER')).rejects.toThrow(
        new ForbiddenException('You are not a member of this workspace'),
      );
    });

    it('returns identical ForbiddenException for non-member and non-existent workspace (enumeration security)', async () => {
      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.requireWorkspaceRole('non_existent_ws', 'usr_1', 'VIEWER'),
      ).rejects.toThrow(new ForbiddenException('You are not a member of this workspace'));
    });
  });

  describe('requireProjectRole', () => {
    it('allows access when project role rank meets minimum requirement', async () => {
      const workspaceMember = {
        id: 'wm_1',
        workspaceId: 'ws_1',
        userId: 'usr_1',
        status: 'ACTIVE',
      };
      const projectMember = {
        id: 'pm_1',
        projectId: 'proj_1',
        role: 'EDITOR',
        project: { id: 'proj_1', workspaceId: 'ws_1' },
      };

      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(workspaceMember);
      (prismaService.projectMember.findUnique as jest.Mock).mockResolvedValueOnce(projectMember);

      const result = await service.requireProjectRole('ws_1', 'proj_1', 'usr_1', 'VIEWER');
      expect(result).toEqual(projectMember);
    });

    it('throws ForbiddenException when project does not belong to requested workspace', async () => {
      const workspaceMember = {
        id: 'wm_1',
        workspaceId: 'ws_1',
        userId: 'usr_1',
        status: 'ACTIVE',
      };
      const projectMember = {
        id: 'pm_1',
        projectId: 'proj_other',
        role: 'OWNER',
        project: { id: 'proj_other', workspaceId: 'ws_OTHER' },
      };

      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(workspaceMember);
      (prismaService.projectMember.findUnique as jest.Mock).mockResolvedValueOnce(projectMember);

      await expect(
        service.requireProjectRole('ws_1', 'proj_other', 'usr_1', 'VIEWER'),
      ).rejects.toThrow(new ForbiddenException('Project does not belong to this workspace'));
    });

    it('throws ForbiddenException when project role rank is below minimum requirement', async () => {
      const workspaceMember = {
        id: 'wm_1',
        workspaceId: 'ws_1',
        userId: 'usr_1',
        status: 'ACTIVE',
      };
      const projectMember = {
        id: 'pm_viewer',
        projectId: 'proj_1',
        role: 'VIEWER',
        project: { id: 'proj_1', workspaceId: 'ws_1' },
      };

      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(workspaceMember);
      (prismaService.projectMember.findUnique as jest.Mock).mockResolvedValueOnce(projectMember);

      await expect(service.requireProjectRole('ws_1', 'proj_1', 'usr_1', 'EDITOR')).rejects.toThrow(
        new ForbiddenException('You need at least EDITOR access'),
      );
    });
  });
});
