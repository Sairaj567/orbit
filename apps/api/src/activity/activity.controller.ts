import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { AuthenticatedRequest } from '../auth/types';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';

@Controller('workspaces/:workspaceId')
@UseGuards(SessionAuthGuard, WorkspaceMembershipGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('activity')
  async getWorkspaceActivity(
    @WorkspaceId() workspaceId: string,
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.activityService.getWorkspaceActivity(
      workspaceId,
      req.user!.id,
      parsedLimit,
      cursor,
    );
  }

  @Get('projects/:projectId/activity')
  async getProjectActivity(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.activityService.getProjectActivity(
      workspaceId,
      req.user!.id,
      projectId,
      parsedLimit,
      cursor,
    );
  }
}
