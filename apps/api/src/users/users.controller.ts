import { Body, Controller, Get, Patch, Req, UseGuards, UsePipes } from '@nestjs/common';
import { envelope, updateUserSchema } from '@orbit/shared';
import type { UpdateUserInput } from '@orbit/shared';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import type { AuthenticatedRequest } from '../auth/types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.getUserProfile(req.user!.id);
    return envelope(user);
  }

  @Patch('me')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  async updateProfile(@Req() req: AuthenticatedRequest, @Body() body: UpdateUserInput) {
    const updatedUser = await this.usersService.updateUserProfile(req.user!.id, body);
    return envelope(updatedUser);
  }
}
