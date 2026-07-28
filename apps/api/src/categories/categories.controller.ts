import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  createCategorySchema,
  updateCategorySchema,
} from '@orbit/shared';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('workspaces/:workspaceId/categories')
@UseGuards(SessionAuthGuard, WorkspaceMembershipGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createCategorySchema))
  create(@WorkspaceId() workspaceId: string, @Body() createCategoryDto: CreateCategoryInput) {
    return this.categoriesService.create(workspaceId, createCategoryDto);
  }

  @Get()
  findAll(@WorkspaceId() workspaceId: string) {
    return this.categoriesService.findAll(workspaceId);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateCategorySchema))
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryInput,
  ) {
    return this.categoriesService.update(workspaceId, id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@WorkspaceId() workspaceId: string, @Param('id') id: string) {
    return this.categoriesService.remove(workspaceId, id);
  }
}
