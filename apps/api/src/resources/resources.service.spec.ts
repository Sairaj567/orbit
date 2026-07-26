import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ActivityService } from '../activity/activity.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ResourcesService } from './resources.service';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let permissionsService: jest.Mocked<ProjectPermissionsService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        {
          provide: PrismaService,
          useValue: {
            resource: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            workspaceMember: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: ProjectPermissionsService,
          useValue: {
            requireProjectRole: jest.fn(),
            requireWorkspaceRole: jest.fn(),
          },
        },
        {
          provide: ActivityService,
          useValue: {
            recordActivity: jest.fn(),
          },
        },
        {
          provide: RealtimeService,
          useValue: {
            broadcast: jest.fn(),
          },
        },
        {
          provide: AiService,
          useValue: {
            embedEntity: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    permissionsService = module.get(ProjectPermissionsService);
    prismaService = module.get(PrismaService);
  });

  describe('create', () => {
    it('requires EDITOR project role when creating assigned resource (projectId present)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const input = { url: 'https://example.com', projectId: 'proj_1' };

      (prismaService.resource.create as jest.Mock).mockResolvedValueOnce({
        id: 'res_1',
        url: 'https://example.com',
        projectId: 'proj_1',
        workspaceId,
      });

      await service.create(workspaceId, userId, input as never);

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_1',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).not.toHaveBeenCalled();
    });

    it('requires MEMBER workspace role when creating unassigned resource (projectId absent)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const input = { url: 'https://example.com' };

      (prismaService.resource.create as jest.Mock).mockResolvedValueOnce({
        id: 'res_2',
        url: 'https://example.com',
        projectId: null,
        workspaceId,
      });

      await service.create(workspaceId, userId, input as never);

      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledWith(
        workspaceId,
        userId,
        'MEMBER',
      );
      expect(permissionsService.requireProjectRole).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('requires EDITOR project role on current project and skips target check when projectId is unchanged', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const resourceId = 'res_1';
      const existingResource = { id: resourceId, projectId: 'proj_1', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingResource as never);
      (prismaService.resource.update as jest.Mock).mockResolvedValueOnce({
        ...existingResource,
        title: 'Updated',
      });

      await service.update(workspaceId, userId, resourceId, { title: 'Updated' });

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_1',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).not.toHaveBeenCalled();
    });

    it('requires MEMBER workspace role on current resource and skips target check when unassigned resource is updated without projectId', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const resourceId = 'res_unassigned';
      const existingResource = { id: resourceId, projectId: null, workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingResource as never);
      (prismaService.resource.update as jest.Mock).mockResolvedValueOnce({
        ...existingResource,
        title: 'Updated',
      });

      await service.update(workspaceId, userId, resourceId, { title: 'Updated' });

      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledWith(
        workspaceId,
        userId,
        'MEMBER',
      );
      expect(permissionsService.requireProjectRole).not.toHaveBeenCalled();
    });

    it('requires EDITOR on current project AND MEMBER on workspace when unassigning resource (data.projectId = null)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const resourceId = 'res_1';
      const existingResource = { id: resourceId, projectId: 'proj_1', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingResource as never);
      (prismaService.resource.update as jest.Mock).mockResolvedValueOnce({
        ...existingResource,
        projectId: null,
      });

      await service.update(workspaceId, userId, resourceId, { projectId: null as never });

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_1',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledWith(
        workspaceId,
        userId,
        'MEMBER',
      );
    });

    it('requires EDITOR on current project AND EDITOR on target project when reassigning resource (proj_A -> proj_B)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const resourceId = 'res_1';
      const existingResource = { id: resourceId, projectId: 'proj_A', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingResource as never);
      (prismaService.resource.update as jest.Mock).mockResolvedValueOnce({
        ...existingResource,
        projectId: 'proj_B',
      });

      await service.update(workspaceId, userId, resourceId, { projectId: 'proj_B' });

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(2);
      expect(permissionsService.requireProjectRole).toHaveBeenNthCalledWith(
        1,
        workspaceId,
        'proj_A',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireProjectRole).toHaveBeenNthCalledWith(
        2,
        workspaceId,
        'proj_B',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).not.toHaveBeenCalled();
    });

    it('requires MEMBER on workspace AND EDITOR on target project when assigning previously unassigned resource (null -> proj_A)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const resourceId = 'res_unassigned';
      const existingResource = { id: resourceId, projectId: null, workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingResource as never);
      (prismaService.resource.update as jest.Mock).mockResolvedValueOnce({
        ...existingResource,
        projectId: 'proj_A',
      });

      await service.update(workspaceId, userId, resourceId, { projectId: 'proj_A' });

      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledWith(
        workspaceId,
        userId,
        'MEMBER',
      );
      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_A',
        userId,
        'EDITOR',
      );
    });
  });

  describe('remove', () => {
    it('requires EDITOR project role when deleting assigned resource', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const resourceId = 'res_1';
      const existingResource = { id: resourceId, projectId: 'proj_1', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingResource as never);
      (prismaService.resource.delete as jest.Mock).mockResolvedValueOnce(existingResource);

      await service.remove(workspaceId, userId, resourceId);

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_1',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).not.toHaveBeenCalled();
    });

    it('requires MEMBER workspace role when deleting unassigned resource', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const resourceId = 'res_unassigned';
      const existingResource = { id: resourceId, projectId: null, workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingResource as never);
      (prismaService.resource.delete as jest.Mock).mockResolvedValueOnce(existingResource);

      await service.remove(workspaceId, userId, resourceId);

      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledWith(
        workspaceId,
        userId,
        'MEMBER',
      );
      expect(permissionsService.requireProjectRole).not.toHaveBeenCalled();
    });
  });
});
