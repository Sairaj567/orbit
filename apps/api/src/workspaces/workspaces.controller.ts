import { Controller, Get, Post, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from '@orbit/shared';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { WorkspaceRoles } from '../auth/decorators/workspace-roles.decorator';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthenticatedRequest } from '../auth/types';

@Controller('workspaces')
@UseGuards(ClerkAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createWorkspaceSchema)) data: CreateWorkspaceInput,
  ) {
    return this.workspacesService.create(req.user!.id, data);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.workspacesService.findAllForUser(req.user!.id);
  }

  @Patch(':workspaceId')
  @UseGuards(WorkspaceMembershipGuard)
  @WorkspaceRoles('OWNER', 'ADMIN')
  update(
    @WorkspaceId() workspaceId: string,
    @Body(new ZodValidationPipe(updateWorkspaceSchema)) data: UpdateWorkspaceInput,
  ) {
    return this.workspacesService.update(workspaceId, data);
  }
}
