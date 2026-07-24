import { Module } from '@nestjs/common';
import { ClerkAuthGuard, WorkspaceMembershipGuard } from './guards';

@Module({
  providers: [ClerkAuthGuard, WorkspaceMembershipGuard],
  exports: [ClerkAuthGuard, WorkspaceMembershipGuard],
})
export class AuthModule {}
