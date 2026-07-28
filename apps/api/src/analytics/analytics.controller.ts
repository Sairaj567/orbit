import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId/analytics')
@UseGuards(SessionAuthGuard, WorkspaceMembershipGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Generate latest snapshot for today before returning
    await this.analyticsService.generateDailySnapshot(workspaceId, userId);

    return this.analyticsService.getAnalytics(
      workspaceId,
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('export')
  async exportAnalytics(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.analyticsService.getAnalytics(
      workspaceId,
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    // Simple JSON export for now
    return {
      data,
      exportedAt: new Date().toISOString(),
    };
  }
}
