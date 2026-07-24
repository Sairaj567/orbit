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

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    clerkId: string;
    email: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : 'http://localhost:5173',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
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
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, clerkId: true, email: true },
      });

      if (!user) {
        throw new Error('User not found in database');
      }

      // Attach user to socket
      client.user = user;
      this.logger.log(`Client connected: ${client.id} (User: ${user.id})`);
    } catch (error) {
      this.logger.warn(`Unauthorized connection attempt: ${client.id} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.logger.log(`Client disconnected: ${client.id} (User: ${client.user.id})`);
    }
  }

  @SubscribeMessage('join_workspace')
  async handleJoinWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { workspaceId: string },
  ) {
    if (!client.user || !data.workspaceId) return;

    // Optional: verify user is a member of this workspace
    const isMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: data.workspaceId, userId: client.user.id },
    });

    if (isMember) {
      const room = `workspace:${data.workspaceId}`;
      client.join(room);
      this.logger.debug(`User ${client.user.id} joined ${room}`);
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

    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
      select: { workspaceId: true },
    });

    if (project) {
      const workspaceMember = await this.prisma.workspaceMember.findFirst({
        where: { workspaceId: project.workspaceId, userId: client.user.id },
      });

      if (workspaceMember) {
        const projectMember = await this.prisma.projectMember.findUnique({
          where: {
            projectId_workspaceMemberId: {
              projectId: data.projectId,
              workspaceMemberId: workspaceMember.id
            }
          }
        });

        if (projectMember) {
          const room = `project:${data.projectId}`;
          client.join(room);
          this.logger.debug(`User ${client.user.id} joined ${room}`);
        }
      }
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
}
