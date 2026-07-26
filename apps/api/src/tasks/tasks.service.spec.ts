import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ActivityService } from '../activity/activity.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';
import { RealtimeService } from '../realtime/realtime.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let permissionsService: jest.Mocked<ProjectPermissionsService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
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

    service = module.get<TasksService>(TasksService);
    permissionsService = module.get(ProjectPermissionsService);
    prismaService = module.get(PrismaService);
  });

  describe('create', () => {
    it('requires EDITOR project role when creating assigned task (projectId present)', async () => {
      const workspaceId = 'ws_1';
      const creatorId = 'usr_1';
      const input = { title: 'Test Task', projectId: 'proj_1' };

      (prismaService.task.create as jest.Mock).mockResolvedValueOnce({
        id: 'task_1',
        title: 'Test Task',
        projectId: 'proj_1',
        workspaceId,
        creatorId,
      });

      await service.create(workspaceId, creatorId, input as never);

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_1',
        creatorId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).not.toHaveBeenCalled();
    });

    it('requires MEMBER workspace role when creating unassigned task (projectId absent)', async () => {
      const workspaceId = 'ws_1';
      const creatorId = 'usr_1';
      const input = { title: 'Unassigned Task' };

      (prismaService.task.create as jest.Mock).mockResolvedValueOnce({
        id: 'task_2',
        title: 'Unassigned Task',
        projectId: null,
        workspaceId,
        creatorId,
      });

      await service.create(workspaceId, creatorId, input as never);

      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledWith(
        workspaceId,
        creatorId,
        'MEMBER',
      );
      expect(permissionsService.requireProjectRole).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('requires EDITOR project role on current project and skips target check when projectId is unchanged', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const taskId = 'task_1';
      const existingTask = { id: taskId, projectId: 'proj_1', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingTask as never);
      (prismaService.task.update as jest.Mock).mockResolvedValueOnce({
        ...existingTask,
        title: 'Updated',
      });

      await service.update(workspaceId, userId, taskId, { title: 'Updated' });

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_1',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).not.toHaveBeenCalled();
    });

    it('requires MEMBER workspace role on current task and skips target check when unassigned task is updated without projectId', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const taskId = 'task_unassigned';
      const existingTask = { id: taskId, projectId: null, workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingTask as never);
      (prismaService.task.update as jest.Mock).mockResolvedValueOnce({
        ...existingTask,
        title: 'Updated',
      });

      await service.update(workspaceId, userId, taskId, { title: 'Updated' });

      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledWith(
        workspaceId,
        userId,
        'MEMBER',
      );
      expect(permissionsService.requireProjectRole).not.toHaveBeenCalled();
    });

    it('requires EDITOR on current project AND MEMBER on workspace when unassigning task (data.projectId = null)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const taskId = 'task_1';
      const existingTask = { id: taskId, projectId: 'proj_1', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingTask as never);
      (prismaService.task.update as jest.Mock).mockResolvedValueOnce({
        ...existingTask,
        projectId: null,
      });

      await service.update(workspaceId, userId, taskId, { projectId: null });

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

    it('requires EDITOR on current project AND EDITOR on target project when reassigning task (proj_A -> proj_B)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const taskId = 'task_1';
      const existingTask = { id: taskId, projectId: 'proj_A', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingTask as never);
      (prismaService.task.update as jest.Mock).mockResolvedValueOnce({
        ...existingTask,
        projectId: 'proj_B',
      });

      await service.update(workspaceId, userId, taskId, { projectId: 'proj_B' });

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

    it('requires MEMBER on workspace AND EDITOR on target project when assigning previously unassigned task (null -> proj_A)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const taskId = 'task_unassigned';
      const existingTask = { id: taskId, projectId: null, workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingTask as never);
      (prismaService.task.update as jest.Mock).mockResolvedValueOnce({
        ...existingTask,
        projectId: 'proj_A',
      });

      await service.update(workspaceId, userId, taskId, { projectId: 'proj_A' });

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
    it('requires EDITOR project role when deleting assigned task', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const taskId = 'task_1';
      const existingTask = { id: taskId, projectId: 'proj_1', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingTask as never);
      (prismaService.task.update as jest.Mock).mockResolvedValueOnce({
        ...existingTask,
        deletedAt: new Date(),
      });

      await service.remove(workspaceId, userId, taskId);

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_1',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).not.toHaveBeenCalled();
    });

    it('requires MEMBER workspace role when deleting unassigned task', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const taskId = 'task_unassigned';
      const existingTask = { id: taskId, projectId: null, workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingTask as never);
      (prismaService.task.update as jest.Mock).mockResolvedValueOnce({
        ...existingTask,
        deletedAt: new Date(),
      });

      await service.remove(workspaceId, userId, taskId);

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
