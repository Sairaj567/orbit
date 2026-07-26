import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { ResourcesModule } from './resources/resources.module';
import { NotesModule } from './notes/notes.module';
import { MembersModule } from './members/members.module';
import { ActivityModule } from './activity/activity.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ProjectPermissionsModule } from './project-permissions/project-permissions.module';
import { ProjectMembersModule } from './project-members/project-members.module';
import { HabitsModule } from './habits/habits.module';
import { StudyBlocksModule } from './study-blocks/study-blocks.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AiModule } from './ai/ai.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { UsersModule } from './users/users.module';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      expandVariables: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    PrismaModule,
    RedisModule,
    UsersModule,
    WorkspacesModule,
    TasksModule,
    ProjectsModule,
    ProjectMembersModule,
    ResourcesModule,
    NotesModule,
    MembersModule,
    ActivityModule,
    RealtimeModule,
    ProjectPermissionsModule,
    HabitsModule,
    StudyBlocksModule,
    DashboardModule,
    AiModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
