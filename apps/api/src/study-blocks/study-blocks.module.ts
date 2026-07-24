import { Module } from '@nestjs/common';
import { StudyBlocksController } from './study-blocks.controller';
import { StudyBlocksService } from './study-blocks.service';
import { ActivityModule } from '../activity/activity.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ProjectPermissionsModule } from '../project-permissions/project-permissions.module';

@Module({
  imports: [ActivityModule, RealtimeModule, ProjectPermissionsModule],
  controllers: [StudyBlocksController],
  providers: [StudyBlocksService],
  exports: [StudyBlocksService],
})
export class StudyBlocksModule {}
