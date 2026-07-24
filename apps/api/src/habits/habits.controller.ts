import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitInput, CreateHabitSchema, UpdateHabitInput, UpdateHabitSchema } from '@orbit/shared';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('workspaces/:workspaceId/habits')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(CreateHabitSchema)) data: CreateHabitInput
  ) {
    return this.habitsService.create(workspaceId, userId, data);
  }

  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('projectId') projectId?: string
  ) {
    return this.habitsService.findAll(workspaceId, userId, projectId);
  }

  @Get(':id')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ) {
    return this.habitsService.findOne(workspaceId, userId, id);
  }

  @Patch(':id')
  update(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateHabitSchema)) data: UpdateHabitInput
  ) {
    return this.habitsService.update(workspaceId, userId, id, data);
  }

  @Delete(':id')
  remove(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ) {
    return this.habitsService.remove(workspaceId, userId, id);
  }

  @Post(':id/complete')
  toggleComplete(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string
  ) {
    return this.habitsService.toggleComplete(workspaceId, userId, id);
  }
}
