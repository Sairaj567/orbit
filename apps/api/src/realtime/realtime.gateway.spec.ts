import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { verifyToken } from '@clerk/backend';
import { UserProvisioningService } from '../auth/services/user-provisioning.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from './realtime.gateway';

jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
}));

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let prismaService: jest.Mocked<PrismaService>;

  function createMockSocket(id: string) {
    const rooms = new Set<string>();
    return {
      id,
      rooms,
      join: jest.fn((room: string) => rooms.add(room)),
      leave: jest.fn((room: string) => rooms.delete(room)),
      emit: jest.fn(),
      handshake: { auth: { token: 'mock_token' } },
      disconnect: jest.fn(),
      user: undefined as { id: string; clerkId: string; email: string } | undefined,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock_secret_key'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            workspaceMember: {
              findFirst: jest.fn(),
            },
            project: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
            projectMember: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: UserProvisioningService,
          useValue: {
            provisionUserJit: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('handleJoinWorkspace', () => {
    it('allows active workspace member to join workspace room', async () => {
      const socket = createMockSocket('s1');
      socket.user = { id: 'usr_1', clerkId: 'c1', email: 'u1@ex.com' };

      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'wm_1',
        workspaceId: 'ws_1',
        userId: 'usr_1',
        status: 'ACTIVE',
      });

      await gateway.handleJoinWorkspace(socket as never, { workspaceId: 'ws_1' });

      expect(socket.join).toHaveBeenCalledTimes(1);
      expect(socket.join).toHaveBeenCalledWith('workspace:ws_1');
    });

    it('rejects workspace join when workspaceMember is not active or workspace is soft-deleted', async () => {
      const socket = createMockSocket('s1');
      socket.user = { id: 'usr_1', clerkId: 'c1', email: 'u1@ex.com' };

      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await gateway.handleJoinWorkspace(socket as never, { workspaceId: 'ws_deleted' });

      expect(socket.join).not.toHaveBeenCalled();
    });
  });

  describe('handleJoinProject', () => {
    it('allows active project member to join project room', async () => {
      const socket = createMockSocket('s1');
      socket.user = { id: 'usr_1', clerkId: 'c1', email: 'u1@ex.com' };

      (prismaService.project.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'proj_1',
        workspaceId: 'ws_1',
      });
      (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'wm_1',
        workspaceId: 'ws_1',
        userId: 'usr_1',
      });
      (prismaService.projectMember.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'pm_1',
        projectId: 'proj_1',
        workspaceMemberId: 'wm_1',
      });

      await gateway.handleJoinProject(socket as never, { projectId: 'proj_1' });

      expect(socket.join).toHaveBeenCalledTimes(1);
      expect(socket.join).toHaveBeenCalledWith('project:proj_1');
    });

    it('rejects project join when project is soft-deleted or non-existent', async () => {
      const socket = createMockSocket('s1');
      socket.user = { id: 'usr_1', clerkId: 'c1', email: 'u1@ex.com' };

      (prismaService.project.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await gateway.handleJoinProject(socket as never, { projectId: 'proj_deleted' });

      expect(socket.join).not.toHaveBeenCalled();
    });
  });

  describe('evictUserFromWorkspace', () => {
    it('evicts all user sockets from workspace room and its projects, preserving cross-workspace rooms (ws_OTHER / project:p3)', async () => {
      const socket1 = createMockSocket('s1');
      const socket2 = createMockSocket('s2');
      const user = { id: 'usr_1', clerkId: 'c1', email: 'u1@ex.com' };
      socket1.user = user;
      socket2.user = user;

      // Register sockets via handleConnection
      (verifyToken as jest.Mock).mockResolvedValue({ sub: 'c1' });
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'usr_1',
        clerkId: 'c1',
        email: 'u1@ex.com',
      });

      await gateway.handleConnection(socket1 as never);
      await gateway.handleConnection(socket2 as never);

      // Populate rooms on sockets
      socket1.rooms.add('workspace:ws_1');
      socket1.rooms.add('project:p1');
      socket1.rooms.add('project:p2');
      socket1.rooms.add('workspace:ws_OTHER');
      socket1.rooms.add('project:p3');

      socket2.rooms.add('workspace:ws_1');
      socket2.rooms.add('project:p1');
      socket2.rooms.add('workspace:ws_OTHER');

      (prismaService.project.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'p1' },
        { id: 'p2' },
      ]);

      await gateway.evictUserFromWorkspace('usr_1', 'ws_1');

      // Positive assertions: workspace:ws_1 and project rooms p1, p2 leave
      expect(socket1.leave).toHaveBeenCalledWith('workspace:ws_1');
      expect(socket1.leave).toHaveBeenCalledWith('project:p1');
      expect(socket1.leave).toHaveBeenCalledWith('project:p2');

      expect(socket2.leave).toHaveBeenCalledWith('workspace:ws_1');
      expect(socket2.leave).toHaveBeenCalledWith('project:p1');

      // Negative assertions: ws_OTHER and project:p3 (ws_OTHER) are NEVER left
      expect(socket1.leave).not.toHaveBeenCalledWith('workspace:ws_OTHER');
      expect(socket1.leave).not.toHaveBeenCalledWith('project:p3');

      expect(socket2.leave).not.toHaveBeenCalledWith('workspace:ws_OTHER');
      expect(socket2.leave).not.toHaveBeenCalledWith('project:p3');

      // Eviction event emitted
      expect(socket1.emit).toHaveBeenCalledWith('evicted', { type: 'workspace', id: 'ws_1' });
      expect(socket2.emit).toHaveBeenCalledWith('evicted', { type: 'workspace', id: 'ws_1' });
    });
  });

  describe('evictUserFromProject', () => {
    it('evicts all user sockets from single project room', async () => {
      const socket1 = createMockSocket('s1');
      const user = { id: 'usr_1', clerkId: 'c1', email: 'u1@ex.com' };
      socket1.user = user;

      (verifyToken as jest.Mock).mockResolvedValue({ sub: 'c1' });
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'usr_1',
        clerkId: 'c1',
        email: 'u1@ex.com',
      });

      await gateway.handleConnection(socket1 as never);
      socket1.rooms.add('project:p1');

      gateway.evictUserFromProject('usr_1', 'p1');

      expect(socket1.leave).toHaveBeenCalledWith('project:p1');
      expect(socket1.emit).toHaveBeenCalledWith('evicted', { type: 'project', id: 'p1' });
    });
  });

  describe('userSockets Registry Lifecycle', () => {
    it('adds socket on connect, removes on disconnect, and deletes user key when last socket leaves', async () => {
      const socket1 = createMockSocket('s1');
      const socket2 = createMockSocket('s2');

      (verifyToken as jest.Mock).mockResolvedValue({ sub: 'c1' });
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'usr_1',
        clerkId: 'c1',
        email: 'u1@ex.com',
      });

      await gateway.handleConnection(socket1 as never);
      await gateway.handleConnection(socket2 as never);

      // Access private map to verify registration
      const userSocketsMap = (gateway as unknown as { userSockets: Map<string, Set<unknown>> })
        .userSockets;
      expect(userSocketsMap.get('usr_1')?.size).toBe(2);

      // Disconnect socket 1 -> 1 remaining
      gateway.handleDisconnect(socket1 as never);
      expect(userSocketsMap.get('usr_1')?.size).toBe(1);

      // Disconnect socket 2 -> key deleted completely (no memory leak)
      gateway.handleDisconnect(socket2 as never);
      expect(userSocketsMap.has('usr_1')).toBe(false);
    });
  });
});
