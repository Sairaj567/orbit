import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';

@Controller('workspaces/:workspaceId/ai')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize')
  async summarize(@Body('text') text: string) {
    const summary = await this.aiService.generateSummary(text);
    return { summary };
  }

  @Get('search')
  async search(
    @Param('workspaceId') workspaceId: string,
    @Query('q') query: string,
    @Query('limit') limit?: string
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    const results = await this.aiService.semanticSearch(workspaceId, query, parsedLimit);
    return results;
  }
}
