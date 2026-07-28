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
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';
import { UserProvisioningService } from '../auth/services/user-provisioning.service';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    clerkId: string;
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
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly userProvisioningService: UserProvisioningService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // --- DEV BYPASS: skip all Clerk verification ---
      const authMode = this.configService.get<string>('AUTH_MODE');
      if (authMode === 'dev_bypass') {
        const devUser = await this.userProvisioningService.provisionDevUser();
        client.user = {
          id: devUser.id,
          clerkId: devUser.clerkId,
          email: devUser.email,
        };

        let sockets = this.userSockets.get(devUser.id);
        if (!sockets) {
          sockets = new Set();
          this.userSockets.set(devUser.id, sockets);
        }
        sockets.add(client);

        this.logger.log(`[DEV BYPASS] Client connected: ${client.id} (Dev User: ${devUser.id})`);
        client.emit('authenticated', { userId: devUser.id });
        return;
      }
      // --- END DEV BYPASS ---

      // Extract token from handshake auth
      const token = client.handshake.auth?.token;

      if (!token) {
        throw new Error('No token provided');
      }

      const secretKey = this.configService.get<string>('clerk.secretKey');
      if (!secretKey) {
        throw new Error('Clerk secret key is not configured');
      }

      // Verify the token
      const payload = await verifyToken(token, { secretKey });
      const clerkId = payload.sub;

      if (!clerkId) {
        throw new Error('Clerk token is missing a subject');
      }

      // Find user in DB
      const dbUser = await this.prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, clerkId: true, email: true, deletedAt: true },
      });

      if (dbUser?.deletedAt) {
        throw new Error('User account has been deleted');
      }

      let user = dbUser ? { id: dbUser.id, clerkId: dbUser.clerkId, email: dbUser.email } : null;

      if (!user) {
        try {
          const provisioned = await this.userProvisioningService.provisionUserJit(
            clerkId,
            secretKey,
          );
          user = {
            id: provisioned.id,
            clerkId: provisioned.clerkId,
            email: provisioned.email,
          };
        } catch (error) {
          this.logger.error(
            `JIT provisioning failed during socket connection for ${clerkId}`,
            error,
          );
          client.emit('provisioning_error', {
            message: 'User provisioning failed. Authentication service unavailable.',
            code: 'SERVICE_UNAVAILABLE',
          });
          client.disconnect(true);
          return;
        }
      }

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
    const projectIds = new Set(projects.map((p) => p.id));
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
