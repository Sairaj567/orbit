import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { 
  CreateNoteInput, 
  UpdateNoteInput, 
  NoteQueryInput,
  createNoteSchema,
  updateNoteSchema
} from '@orbit/shared';

@Controller('workspaces/:workspaceId/notes')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() createNoteDto: CreateNoteInput
  ) {
    const parsedData = createNoteSchema.parse(createNoteDto);
    return this.notesService.create(workspaceId, userId, parsedData);
  }

  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query() query: NoteQueryInput
  ) {
    return this.notesService.findAll(workspaceId, userId, query);
  }

  @Get(':id')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.notesService.findOne(workspaceId, userId, id);
  }

  @Patch(':id')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateNoteDto: UpdateNoteInput
  ) {
    const parsedData = updateNoteSchema.parse(updateNoteDto);
    return this.notesService.update(workspaceId, userId, id, parsedData);
  }

  @Delete(':id')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.notesService.remove(workspaceId, userId, id);
  }
}
