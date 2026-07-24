import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, UsePipes } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput, createTaskSchema, updateTaskSchema, taskQuerySchema } from '@orbit/shared';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { AuthenticatedRequest } from '../auth/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('workspaces/:workspaceId/tasks')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createTaskSchema))
  create(
    @Param('workspaceId') workspaceId: string,
    @Req() req: AuthenticatedRequest,
    @Body() createTaskDto: CreateTaskInput
  ) {
    return this.tasksService.create(workspaceId, req.user!.id, createTaskDto);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(taskQuerySchema))
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Req() req: AuthenticatedRequest,
    @Query() query: TaskQueryInput
  ) {
    return this.tasksService.findAll(workspaceId, req.user!.id, query);
  }

  @Get(':id')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.tasksService.findOne(workspaceId, req.user!.id, id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateTaskSchema))
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateTaskDto: UpdateTaskInput
  ) {
    return this.tasksService.update(workspaceId, req.user!.id, id, updateTaskDto);
  }

  @Delete(':id')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.tasksService.remove(workspaceId, req.user!.id, id);
  }
}
