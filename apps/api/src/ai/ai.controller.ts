import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';

@Controller('workspaces/:workspaceId/ai')
@UseGuards(SessionAuthGuard, WorkspaceMembershipGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize')
  async summarize(@Body('text') text: string) {
    const summary = await this.aiService.generateSummary(text);
    return { summary };
  }

  @Get('search')
  async search(
    @WorkspaceId() workspaceId: string,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    const results = await this.aiService.semanticSearch(workspaceId, query, parsedLimit);
    return results;
  }
}
