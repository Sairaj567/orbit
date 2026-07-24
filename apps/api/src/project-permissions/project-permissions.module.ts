import { Global, Module } from '@nestjs/common';
import { ProjectPermissionsService } from './project-permissions.service';

@Global()
@Module({
  providers: [ProjectPermissionsService],
  exports: [ProjectPermissionsService],
})
export class ProjectPermissionsModule {}
