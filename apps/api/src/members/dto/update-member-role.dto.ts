import { IsEnum, IsNotEmpty } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @IsEnum(WorkspaceRole)
  @IsNotEmpty()
  role!: WorkspaceRole;
}
