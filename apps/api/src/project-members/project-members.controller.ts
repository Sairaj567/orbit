import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { AuthenticatedRequest } from '../auth/types';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';

@Controller('workspaces/:workspaceId/projects/:projectId/members')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
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
