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
import { ProjectMembersService } from './project-members.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { AuthenticatedRequest } from '../auth/types';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { z } from 'zod';

const inviteProjectMemberSchema = z.object({
  workspaceMemberId: z.string().cuid(),
  role: z.enum(['VIEWER', 'EDITOR', 'OWNER']),
});

const updateProjectMemberRoleSchema = z.object({
  role: z.enum(['VIEWER', 'EDITOR', 'OWNER']),
});

@Controller('workspaces/:workspaceId/projects/:projectId/members')
@UseGuards(SessionAuthGuard, WorkspaceMembershipGuard)
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Get()
  findAll(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectMembersService.findAll(workspaceId, projectId, req.user!.id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(inviteProjectMemberSchema))
  invite(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Req() req: AuthenticatedRequest,
    @Body() data: { workspaceMemberId: string; role: 'VIEWER' | 'EDITOR' | 'OWNER' },
  ) {
    return this.projectMembersService.invite(
      workspaceId,
      projectId,
      req.user!.id,
      data.workspaceMemberId,
      data.role,
    );
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateProjectMemberRoleSchema))
  update(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() data: { role: 'VIEWER' | 'EDITOR' | 'OWNER' },
  ) {
    return this.projectMembersService.updateRole(
      workspaceId,
      projectId,
      req.user!.id,
      id,
      data.role,
    );
  }

  @Delete(':id')
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectMembersService.remove(workspaceId, projectId, req.user!.id, id);
  }
}
