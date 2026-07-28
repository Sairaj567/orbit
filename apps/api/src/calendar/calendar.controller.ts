import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';

@Controller('workspaces/:workspaceId/calendar')
@UseGuards(SessionAuthGuard, WorkspaceMembershipGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getEvents(
    @WorkspaceId() workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate query parameters are required');
    }
    return this.calendarService.getCalendarEvents(workspaceId, userId, startDate, endDate);
  }
}
