import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UsePipes,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from '@orbit/shared';
import { WorkspaceRole } from '@prisma/client';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { WorkspaceRoles } from '../auth/decorators/workspace-roles.decorator';
import { AuthenticatedRequest } from '../auth/types';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('workspaces/:workspaceId/projects')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER)
  @UsePipes(new ZodValidationPipe(createProjectSchema))
  create(
    @WorkspaceId() workspaceId: string,
    @Req() req: AuthenticatedRequest,
    @Body() createProjectDto: CreateProjectInput,
  ) {
    return this.projectsService.create(createProjectDto, req.user!.id, workspaceId);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(projectQuerySchema))
  findAll(
    @WorkspaceId() workspaceId: string,
    @Req() req: AuthenticatedRequest,
    @Query() query: ProjectQueryInput,
  ) {
    return this.projectsService.findAll(workspaceId, req.user!.id, query);
  }

  @Get(':id')
  findOne(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.findOne(id, workspaceId, req.user!.id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateProjectSchema))
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateProjectDto: UpdateProjectInput,
  ) {
    return this.projectsService.update(id, workspaceId, req.user!.id, updateProjectDto);
  }

  @Delete(':id')
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.remove(id, workspaceId, req.user!.id);
  }
}
