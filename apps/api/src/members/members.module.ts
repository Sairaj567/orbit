import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MembersController } from './members.controller';
import { InvitesController } from './invites.controller';
import { MembersService } from './members.service';
import { ActivityModule } from '../activity/activity.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PrismaModule, ActivityModule, RealtimeModule],
  controllers: [MembersController, InvitesController],
  providers: [MembersService],
})
export class MembersModule {}
