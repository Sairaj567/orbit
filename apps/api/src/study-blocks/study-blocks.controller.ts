import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { StudyBlocksService } from './study-blocks.service';
import {
  CreateStudyBlockInput,
  CreateStudyBlockSchema,
  UpdateStudyBlockInput,
  UpdateStudyBlockSchema,
  CompleteStudyBlockInput,
  CompleteStudyBlockSchema,
} from '@orbit/shared';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('workspaces/:workspaceId/study-blocks')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class StudyBlocksController {
  constructor(private readonly studyBlocksService: StudyBlocksService) {}

  @Post()
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(CreateStudyBlockSchema)) data: CreateStudyBlockInput,
  ) {
    return this.studyBlocksService.create(workspaceId, userId, data);
  }

  @Get('active')
  findActive(@WorkspaceId() workspaceId: string, @CurrentUser('id') userId: string) {
    return this.studyBlocksService.findActive(workspaceId, userId);
  }

  @Patch(':id')
  update(
    @WorkspaceId() workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStudyBlockSchema)) data: UpdateStudyBlockInput,
  ) {
    return this.studyBlocksService.update(workspaceId, userId, id, data);
  }

  @Post(':id/complete')
  complete(
    @WorkspaceId() workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CompleteStudyBlockSchema)) data: CompleteStudyBlockInput,
  ) {
    return this.studyBlocksService.complete(workspaceId, userId, id, data);
  }

  @Post(':id/cancel')
  cancel(
    @WorkspaceId() workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.studyBlocksService.cancel(workspaceId, userId, id);
  }
}
