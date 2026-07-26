import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ActivityService } from '../activity/activity.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectPermissionsService } from '../project-permissions/project-permissions.service';
import { RealtimeService } from '../realtime/realtime.service';
import { NotesService } from './notes.service';

describe('NotesService', () => {
  let service: NotesService;
  let permissionsService: jest.Mocked<ProjectPermissionsService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: PrismaService,
          useValue: {
            note: {
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

    service = module.get<NotesService>(NotesService);
    permissionsService = module.get(ProjectPermissionsService);
    prismaService = module.get(PrismaService);
  });

  describe('create', () => {
    it('requires EDITOR project role when creating assigned note (projectId present)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const input = { title: 'Test Note', projectId: 'proj_1', content: 'hello' };

      (prismaService.note.create as jest.Mock).mockResolvedValueOnce({
        id: 'note_1',
        title: 'Test Note',
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

    it('requires MEMBER workspace role when creating unassigned note (projectId absent)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const input = { title: 'Unassigned Note', content: 'hello' };

      (prismaService.note.create as jest.Mock).mockResolvedValueOnce({
        id: 'note_2',
        title: 'Unassigned Note',
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
      const noteId = 'note_1';
      const existingNote = { id: noteId, projectId: 'proj_1', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingNote as never);
      (prismaService.note.update as jest.Mock).mockResolvedValueOnce({
        ...existingNote,
        title: 'Updated',
      });

      await service.update(workspaceId, userId, noteId, { title: 'Updated' });

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_1',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).not.toHaveBeenCalled();
    });

    it('requires MEMBER workspace role on current note and skips target check when unassigned note is updated without projectId', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const noteId = 'note_unassigned';
      const existingNote = { id: noteId, projectId: null, workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingNote as never);
      (prismaService.note.update as jest.Mock).mockResolvedValueOnce({
        ...existingNote,
        title: 'Updated',
      });

      await service.update(workspaceId, userId, noteId, { title: 'Updated' });

      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireWorkspaceRole).toHaveBeenCalledWith(
        workspaceId,
        userId,
        'MEMBER',
      );
      expect(permissionsService.requireProjectRole).not.toHaveBeenCalled();
    });

    it('requires EDITOR on current project AND MEMBER on workspace when unassigning note (data.projectId = null)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const noteId = 'note_1';
      const existingNote = { id: noteId, projectId: 'proj_1', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingNote as never);
      (prismaService.note.update as jest.Mock).mockResolvedValueOnce({
        ...existingNote,
        projectId: null,
      });

      await service.update(workspaceId, userId, noteId, { projectId: null as never });

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

    it('requires EDITOR on current project AND EDITOR on target project when reassigning note (proj_A -> proj_B)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const noteId = 'note_1';
      const existingNote = { id: noteId, projectId: 'proj_A', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingNote as never);
      (prismaService.note.update as jest.Mock).mockResolvedValueOnce({
        ...existingNote,
        projectId: 'proj_B',
      });

      await service.update(workspaceId, userId, noteId, { projectId: 'proj_B' });

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

    it('requires MEMBER on workspace AND EDITOR on target project when assigning previously unassigned note (null -> proj_A)', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const noteId = 'note_unassigned';
      const existingNote = { id: noteId, projectId: null, workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingNote as never);
      (prismaService.note.update as jest.Mock).mockResolvedValueOnce({
        ...existingNote,
        projectId: 'proj_A',
      });

      await service.update(workspaceId, userId, noteId, { projectId: 'proj_A' });

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
    it('requires EDITOR project role when deleting assigned note', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const noteId = 'note_1';
      const existingNote = { id: noteId, projectId: 'proj_1', workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingNote as never);
      (prismaService.note.delete as jest.Mock).mockResolvedValueOnce(existingNote);

      await service.remove(workspaceId, userId, noteId);

      expect(permissionsService.requireProjectRole).toHaveBeenCalledTimes(1);
      expect(permissionsService.requireProjectRole).toHaveBeenCalledWith(
        workspaceId,
        'proj_1',
        userId,
        'EDITOR',
      );
      expect(permissionsService.requireWorkspaceRole).not.toHaveBeenCalled();
    });

    it('requires MEMBER workspace role when deleting unassigned note', async () => {
      const workspaceId = 'ws_1';
      const userId = 'usr_1';
      const noteId = 'note_unassigned';
      const existingNote = { id: noteId, projectId: null, workspaceId };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingNote as never);
      (prismaService.note.delete as jest.Mock).mockResolvedValueOnce(existingNote);

      await service.remove(workspaceId, userId, noteId);

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
