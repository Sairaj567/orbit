import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

import { AuthService } from '../auth/services/auth.service';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : 'http://localhost:5173',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly userSockets = new Map<string, Set<AuthenticatedSocket>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const cookies = client.handshake.headers.cookie;
      const token = cookies
        ?.split(';')
        .find((c) => c.trim().startsWith('orbit_session='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No session cookie provided');
      }

      const session = await this.authService.validateSession(token);

      if (!session) {
        throw new Error('Invalid or expired session');
      }

      const user = {
        id: session.user.id,
        email: session.user.email,
      };

      // Attach user to socket
      client.user = user;

      let sockets = this.userSockets.get(user.id);
      if (!sockets) {
        sockets = new Set();
        this.userSockets.set(user.id, sockets);
      }
      sockets.add(client);

      this.logger.log(`Client connected: ${client.id} (User: ${user.id})`);
      client.emit('authenticated', { userId: user.id });
    } catch (error) {
      this.logger.warn(
        `Unauthorized connection attempt: ${client.id} - ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      const sockets = this.userSockets.get(client.user.id);
      if (sockets) {
        sockets.delete(client);
        if (sockets.size === 0) {
          this.userSockets.delete(client.user.id);
        }
      }
      this.logger.log(`Client disconnected: ${client.id} (User: ${client.user.id})`);
    }
  }

  @SubscribeMessage('join_workspace')
  async handleJoinWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { workspaceId: string },
  ) {
    if (!client.user || !data.workspaceId) return;

    const isMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: data.workspaceId,
        userId: client.user.id,
        status: 'ACTIVE',
        workspace: { deletedAt: null },
      },
    });

    if (isMember) {
      const room = `workspace:${data.workspaceId}`;
      client.join(room);
      this.logger.debug(`User ${client.user.id} joined ${room}`);
      client.emit('joined_workspace', { workspaceId: data.workspaceId });
    }
  }

  @SubscribeMessage('leave_workspace')
  handleLeaveWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { workspaceId: string },
  ) {
    if (client.user && data.workspaceId) {
      const room = `workspace:${data.workspaceId}`;
      client.leave(room);
      this.logger.debug(`User ${client.user.id} left ${room}`);
    }
  }

  @SubscribeMessage('join_project')
  async handleJoinProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    if (!client.user || !data.projectId) return;

    const project = await this.prisma.project.findFirst({
      where: {
        id: data.projectId,
        deletedAt: null,
        workspace: { deletedAt: null },
      },
      select: { workspaceId: true },
    });

    if (!project) return;

    const workspaceMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: project.workspaceId,
        userId: client.user.id,
        status: 'ACTIVE',
        workspace: { deletedAt: null },
      },
    });

    if (!workspaceMember) return;

    const projectMember = await this.prisma.projectMember.findUnique({
      where: {
        projectId_workspaceMemberId: {
          projectId: data.projectId,
          workspaceMemberId: workspaceMember.id,
        },
      },
    });

    if (projectMember) {
      const room = `project:${data.projectId}`;
      client.join(room);
      this.logger.debug(`User ${client.user.id} joined ${room}`);
    }
  }

  @SubscribeMessage('leave_project')
  handleLeaveProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    if (client.user && data.projectId) {
      const room = `project:${data.projectId}`;
      client.leave(room);
      this.logger.debug(`User ${client.user.id} left ${room}`);
    }
  }

  async evictUserFromWorkspace(userId: string, workspaceId: string) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      select: { id: true },
    });
    const projectIds = new Set(projects.map((p: any) => p.id));
    const workspaceRoom = `workspace:${workspaceId}`;

    for (const socket of sockets) {
      socket.leave(workspaceRoom);

      for (const room of socket.rooms) {
        if (room.startsWith('project:')) {
          const projectId = room.replace('project:', '');
          if (projectIds.has(projectId)) {
            socket.leave(room);
          }
        }
      }

      socket.emit('evicted', { type: 'workspace', id: workspaceId });
    }
    this.logger.log(
      `Evicted user ${userId} sockets from workspace ${workspaceId} and its projects.`,
    );
  }

  evictUserFromProject(userId: string, projectId: string) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    const room = `project:${projectId}`;
    for (const socket of sockets) {
      socket.leave(room);
      socket.emit('evicted', { type: 'project', id: projectId });
    }
    this.logger.log(`Evicted user ${userId} sockets from project ${projectId}.`);
  }
}
