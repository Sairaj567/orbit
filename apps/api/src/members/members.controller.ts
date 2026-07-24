import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceRoles } from '../auth/decorators/workspace-roles.decorator';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { WorkspaceMembershipGuard } from '../auth/guards/workspace-membership.guard';
import { WorkspaceId } from '../common/decorators/workspace-id.decorator';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { MembersService } from './members.service';

@Controller('workspaces/:workspaceId/members')
@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER, WorkspaceRole.VIEWER)
  async findAll(@WorkspaceId() workspaceId: string) {
    const data = await this.membersService.findAll(workspaceId);
    return { data, errors: null };
  }

  @Post()
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async invite(
    @WorkspaceId() workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    const data = await this.membersService.invite(workspaceId, userId, dto);
    return { data, errors: null };
  }

  @Patch(':id')
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async updateRole(
    @WorkspaceId() workspaceId: string,
    @Param('id') memberId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    const data = await this.membersService.updateRole(
      workspaceId,
      memberId,
      userId,
      dto,
    );
    return { data, errors: null };
  }

  @Delete(':id')
  @WorkspaceRoles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async remove(
    @WorkspaceId() workspaceId: string,
    @Param('id') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.membersService.remove(
      workspaceId,
      memberId,
      userId,
    );
    return { data, errors: null };
  }
}
