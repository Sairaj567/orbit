import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, ActivityModule, AiModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
