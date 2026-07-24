import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { AuthenticatedRequest } from '../auth/types';

@Controller('workspaces/:workspaceId')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('activity')
  async getWorkspaceActivity(
    @Param('workspaceId') workspaceId: string,
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.activityService.getWorkspaceActivity(workspaceId, req.user!.id, parsedLimit, cursor);
  }

  @Get('projects/:projectId/activity')
  async getProjectActivity(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.activityService.getProjectActivity(workspaceId, req.user!.id, projectId, parsedLimit, cursor);
  }
}
