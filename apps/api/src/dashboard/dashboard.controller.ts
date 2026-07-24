import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';

@Controller('workspaces/:workspaceId/dashboard')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @Param('workspaceId') workspaceId: string,
    @Request() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    return this.dashboardService.getDashboardData(workspaceId, userId);
  }
}
