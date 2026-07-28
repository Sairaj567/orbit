import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UsePipes,
} from '@nestjs/common';
import { TaskCommentsService } from './task-comments.service';
import {
  CreateTaskCommentInput,
  UpdateTaskCommentInput,
  createTaskCommentSchema,
  updateTaskCommentSchema,
} from '@orbit/shared';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { WorkspaceMembershipGuard } from '../../auth/guards/workspace-membership.guard';
import { AuthenticatedRequest } from '../../auth/types';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('workspaces/:workspaceId/tasks/:taskId/comments')
@UseGuards(SessionAuthGuard, WorkspaceMembershipGuard)
export class TaskCommentsController {
  constructor(private readonly commentsService: TaskCommentsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createTaskCommentSchema))
  create(
    @WorkspaceId() workspaceId: string,
    @Param('taskId') taskId: string,
    @Req() req: AuthenticatedRequest,
    @Body() createCommentDto: CreateTaskCommentInput,
  ) {
    return this.commentsService.create(workspaceId, req.user!.id, taskId, createCommentDto);
  }

  @Get()
  findAll(
    @WorkspaceId() workspaceId: string,
    @Param('taskId') taskId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsService.findAll(workspaceId, req.user!.id, taskId);
  }

  @Patch(':commentId')
  @UsePipes(new ZodValidationPipe(updateTaskCommentSchema))
  update(
    @WorkspaceId() workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateCommentDto: UpdateTaskCommentInput,
  ) {
    return this.commentsService.update(
      workspaceId,
      req.user!.id,
      taskId,
      commentId,
      updateCommentDto,
    );
  }

  @Delete(':commentId')
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsService.remove(workspaceId, req.user!.id, taskId, commentId);
  }
}
