import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';

@Controller('workspaces/:workspaceId/dashboard')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@WorkspaceId() workspaceId: string, @Request() req: { user: { id: string } }) {
    const userId = req.user.id;
    return this.dashboardService.getDashboardData(workspaceId, userId);
  }
}
