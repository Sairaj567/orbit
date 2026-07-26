import { Injectable, Logger } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import type { RealtimeEvent } from '@orbit/shared';

export interface BroadcastOptions<T> {
  workspaceId: string;
  projectId?: string | null;
  event: RealtimeEvent;
  payload: T;
  actorId?: string;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  /**
   * Broadcasts an event to a workspace or a specific project room.
   */
  broadcast<T>(options: BroadcastOptions<T>): void {
    const { workspaceId, projectId, event, payload, actorId } = options;

    try {
      const room = projectId ? `project:${projectId}` : `workspace:${workspaceId}`;

      this.logger.debug(`Broadcasting ${event} to ${room}`);

      this.gateway.server.to(room).emit(event, {
        workspaceId,
        projectId,
        event,
        payload,
        actorId,
      });
    } catch (error) {
      // Realtime errors must NEVER break the application
      this.logger.error(`Failed to broadcast event ${event}`, error);
    }
  }

  async evictWorkspaceUser(workspaceId: string, userId: string): Promise<void> {
    try {
      await this.gateway.evictUserFromWorkspace(userId, workspaceId);
    } catch (error) {
      this.logger.error(`Failed to evict user ${userId} from workspace ${workspaceId}`, error);
    }
  }

  evictProjectUser(projectId: string, userId: string): void {
    try {
      this.gateway.evictUserFromProject(userId, projectId);
    } catch (error) {
      this.logger.error(`Failed to evict user ${userId} from project ${projectId}`, error);
    }
  }
}
