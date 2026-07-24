import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UsePipes } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceInput, UpdateResourceInput, ResourceQueryInput, createResourceSchema, updateResourceSchema, resourceQuerySchema } from '@orbit/shared';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId/resources')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createResourceSchema))
  create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() createResourceDto: CreateResourceInput
  ) {
    return this.resourcesService.create(workspaceId, userId, createResourceDto);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(resourceQuerySchema))
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query() query: ResourceQueryInput
  ) {
    return this.resourcesService.findAll(workspaceId, userId, query);
  }

  @Get(':id')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.resourcesService.findOne(workspaceId, userId, id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateResourceSchema))
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateResourceDto: UpdateResourceInput
  ) {
    return this.resourcesService.update(workspaceId, userId, id, updateResourceDto);
  }

  @Delete(':id')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.resourcesService.remove(workspaceId, userId, id);
  }
}
