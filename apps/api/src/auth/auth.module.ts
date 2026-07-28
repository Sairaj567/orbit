import { Global, Module } from '@nestjs/common';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { WorkspaceMembershipGuard } from './guards/workspace-membership.guard';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';

@Global()
@Module({
  controllers: [AuthController],
  providers: [SessionAuthGuard, WorkspaceMembershipGuard, AuthService],
  exports: [SessionAuthGuard, WorkspaceMembershipGuard, AuthService],
})
export class AuthModule {}
