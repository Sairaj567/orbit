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
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import {
  CreateNoteInput,
  UpdateNoteInput,
  NoteQueryInput,
  createNoteSchema,
  updateNoteSchema,
} from '@orbit/shared';

@Controller('workspaces/:workspaceId/notes')
@UseGuards(SessionAuthGuard, WorkspaceMembershipGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() createNoteDto: CreateNoteInput,
  ) {
    const parsedData = createNoteSchema.parse(createNoteDto);
    return this.notesService.create(workspaceId, userId, parsedData);
  }

  @Get()
  findAll(
    @WorkspaceId() workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query() query: NoteQueryInput,
  ) {
    return this.notesService.findAll(workspaceId, userId, query);
  }

  @Get(':id')
  findOne(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notesService.findOne(workspaceId, userId, id);
  }

  @Patch(':id')
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateNoteDto: UpdateNoteInput,
  ) {
    const parsedData = updateNoteSchema.parse(updateNoteDto);
    return this.notesService.update(workspaceId, userId, id, parsedData);
  }

  @Delete(':id')
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notesService.remove(workspaceId, userId, id);
  }
}
