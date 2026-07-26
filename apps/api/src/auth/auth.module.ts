import { Global, Module } from '@nestjs/common';
import { ClerkAuthGuard, WorkspaceMembershipGuard } from './guards';
import { UserProvisioningService } from './services/user-provisioning.service';

@Global()
@Module({
  providers: [ClerkAuthGuard, WorkspaceMembershipGuard, UserProvisioningService],
  exports: [ClerkAuthGuard, WorkspaceMembershipGuard, UserProvisioningService],
})
export class AuthModule {}
