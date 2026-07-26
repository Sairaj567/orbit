import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { Webhook } from 'svix';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AiService } from '../src/ai/ai.service';
import { RealtimeService } from '../src/realtime/realtime.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { assertTestDatabaseSafety, resetTestDatabase } from './helpers/test-db-safety';

const WEBHOOK_SECRET =
  process.env.CLERK_WEBHOOK_SECRET || 'whsec_C2Fyc29uY2l0eTExMTExMTExMTExMTExMTExMTExMTE=';

function createSignedSvixHeaders(payloadObj: object, msgId = 'msg_test_123') {
  const payloadString = JSON.stringify(payloadObj);
  const wh = new Webhook(WEBHOOK_SECRET);
  const now = new Date();
  // Svix sign signature: wh.sign(msgId, timestamp, payload)
  const signature = wh.sign(msgId, now, payloadString);

  return {
    'svix-id': msgId,
    'svix-timestamp': Math.floor(now.getTime() / 1000).toString(),
    'svix-signature': signature,
    'content-type': 'application/json',
  };
}

describe('Clerk Webhooks E2E Integration (/api/v1/webhooks/clerk)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AiService)
      .useValue({
        embedEntity: jest.fn(),
        generateEmbedding: jest.fn(),
      })
      .overrideProvider(RealtimeService)
      .useValue({
        broadcast: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Hard Safety Gate: Assert current database is orbit_test before executing tests
    await assertTestDatabaseSafety(prisma);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await resetTestDatabase(prisma);
  });

  it('handles user.deleted for multi-member workspace: transfers ownership, reassigns tasks, explicitly cleans TaskAssignee, and soft-deletes User', async () => {
    // Seed Users
    await prisma.user.createMany({
      data: [
        {
          id: 'usr_owner_del',
          clerkId: 'clerk_owner_del',
          email: 'owner_del@test.com',
          displayName: 'Owner to Delete',
        },
        {
          id: 'usr_admin_transfer',
          clerkId: 'clerk_admin_transfer',
          email: 'admin@test.com',
          displayName: 'Admin Recipient',
        },
      ],
    });

    // Seed Workspace
    await prisma.workspace.create({
      data: { id: 'ws_cascades', name: 'Cascades Workspace', slug: 'cascades-ws' },
    });

    // Seed Memberships: User A is OWNER (joined earlier), User B is ADMIN (joined later)
    await prisma.workspaceMember.createMany({
      data: [
        {
          id: 'wm_owner',
          workspaceId: 'ws_cascades',
          userId: 'usr_owner_del',
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date('2026-01-01'),
        },
        {
          id: 'wm_admin',
          workspaceId: 'ws_cascades',
          userId: 'usr_admin_transfer',
          role: 'ADMIN',
          status: 'ACTIVE',
          joinedAt: new Date('2026-01-02'),
        },
      ],
    });

    // Seed Project created by User A
    await prisma.project.create({
      data: {
        id: 'proj_1',
        workspaceId: 'ws_cascades',
        creatorId: 'usr_owner_del',
        name: 'Project 1',
      },
    });

    // Seed Tasks created by User A
    await prisma.task.createMany({
      data: [
        { id: 'task_1', workspaceId: 'ws_cascades', creatorId: 'usr_owner_del', title: 'Task 1' },
        { id: 'task_2', workspaceId: 'ws_cascades', creatorId: 'usr_owner_del', title: 'Task 2' },
      ],
    });

    // Seed TaskAssignee row for task_2 -> User A
    await prisma.taskAssignee.create({
      data: { taskId: 'task_2', userId: 'usr_owner_del' },
    });

    const webhookPayload = {
      type: 'user.deleted',
      data: { id: 'clerk_owner_del', deleted: true },
    };

    const headers = createSignedSvixHeaders(webhookPayload, 'msg_del_1');

    const res = await request(app.getHttpServer())
      .post('/api/v1/webhooks/clerk')
      .set(headers)
      .send(webhookPayload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: { success: true }, errors: null });

    // Assert DB mutations in orbit_test
    // 1. User A soft-deleted (deletedAt is set)
    const softDeletedUser = await prisma.user.findUnique({ where: { id: 'usr_owner_del' } });
    expect(softDeletedUser).not.toBeNull();
    expect(softDeletedUser?.deletedAt).not.toBeNull();

    // 2. WorkspaceMember for User A deleted
    const deletedMember = await prisma.workspaceMember.findUnique({ where: { id: 'wm_owner' } });
    expect(deletedMember).toBeNull();

    // 3. Workspace ownership transferred to User B (ADMIN promoted to OWNER)
    const updatedAdminMember = await prisma.workspaceMember.findUnique({
      where: { id: 'wm_admin' },
    });
    expect(updatedAdminMember?.role).toBe('OWNER');

    // 4. Tasks reassigned to User B (new OWNER)
    const updatedTask1 = await prisma.task.findUnique({ where: { id: 'task_1' } });
    expect(updatedTask1?.creatorId).toBe('usr_admin_transfer');

    const updatedTask2 = await prisma.task.findUnique({ where: { id: 'task_2' } });
    expect(updatedTask2?.creatorId).toBe('usr_admin_transfer');

    // 5. TaskAssignee row for soft-deleted User A is explicitly deleted by application cleanup
    const deletedAssignee = await prisma.taskAssignee.findUnique({
      where: { taskId_userId: { taskId: 'task_2', userId: 'usr_owner_del' } },
    });
    expect(deletedAssignee).toBeNull();
  });

  it('handles user.deleted for sole-member workspace: soft-deletes workspace, tasks, and User record (preserving task data)', async () => {
    // Seed User
    await prisma.user.create({
      data: {
        id: 'usr_sole',
        clerkId: 'clerk_sole',
        email: 'sole@test.com',
        displayName: 'Sole Member',
      },
    });

    // Seed Workspace
    await prisma.workspace.create({
      data: { id: 'ws_sole', name: 'Sole Workspace', slug: 'sole-ws' },
    });

    // Seed WorkspaceMember
    await prisma.workspaceMember.create({
      data: {
        id: 'wm_sole',
        workspaceId: 'ws_sole',
        userId: 'usr_sole',
        role: 'OWNER',
        status: 'ACTIVE',
      },
    });

    // Seed Task
    await prisma.task.create({
      data: { id: 'task_sole', workspaceId: 'ws_sole', creatorId: 'usr_sole', title: 'Sole Task' },
    });

    const webhookPayload = {
      type: 'user.deleted',
      data: { id: 'clerk_sole', deleted: true },
    };

    const headers = createSignedSvixHeaders(webhookPayload, 'msg_del_2');

    const res = await request(app.getHttpServer())
      .post('/api/v1/webhooks/clerk')
      .set(headers)
      .send(webhookPayload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: { success: true }, errors: null });

    // Assert DB soft-deletes in orbit_test
    const softDeletedWs = await prisma.workspace.findUnique({ where: { id: 'ws_sole' } });
    expect(softDeletedWs?.deletedAt).not.toBeNull();

    // Task is soft-deleted (data preserved!)
    const softDeletedTask = await prisma.task.findUnique({ where: { id: 'task_sole' } });
    expect(softDeletedTask).not.toBeNull();
    expect(softDeletedTask?.deletedAt).not.toBeNull();

    // User is soft-deleted (deletedAt set)
    const softDeletedUser = await prisma.user.findUnique({ where: { id: 'usr_sole' } });
    expect(softDeletedUser).not.toBeNull();
    expect(softDeletedUser?.deletedAt).not.toBeNull();
  });

  it('handles user.deleted for creator who is no longer a workspace member: reassigns task creatorId and soft-deletes User', async () => {
    // Seed Users
    await prisma.user.createMany({
      data: [
        {
          id: 'usr_creator_removed',
          clerkId: 'clerk_creator_removed',
          email: 'removed@test.com',
          displayName: 'Removed Creator',
        },
        {
          id: 'usr_ws_owner',
          clerkId: 'clerk_ws_owner',
          email: 'wsowner@test.com',
          displayName: 'Workspace Owner',
        },
      ],
    });

    // Seed Workspace
    await prisma.workspace.create({
      data: { id: 'ws_orphan', name: 'Orphan Workspace', slug: 'orphan-ws' },
    });

    // Seed Membership for Workspace Owner only (usr_creator_removed is NOT a member)
    await prisma.workspaceMember.create({
      data: {
        id: 'wm_ws_owner',
        workspaceId: 'ws_orphan',
        userId: 'usr_ws_owner',
        role: 'OWNER',
        status: 'ACTIVE',
      },
    });

    // Seed Task created by non-member User
    await prisma.task.create({
      data: {
        id: 'task_orphan',
        workspaceId: 'ws_orphan',
        creatorId: 'usr_creator_removed',
        title: 'Orphan Task',
      },
    });

    const webhookPayload = {
      type: 'user.deleted',
      data: { id: 'clerk_creator_removed', deleted: true },
    };

    const headers = createSignedSvixHeaders(webhookPayload, 'msg_del_3');

    const res = await request(app.getHttpServer())
      .post('/api/v1/webhooks/clerk')
      .set(headers)
      .send(webhookPayload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: { success: true }, errors: null });

    // Assert Task creatorId reassigned to active workspace owner in orbit_test
    const reassignedTask = await prisma.task.findUnique({ where: { id: 'task_orphan' } });
    expect(reassignedTask?.creatorId).toBe('usr_ws_owner');

    // Assert User is soft-deleted
    const softDeletedUser = await prisma.user.findUnique({ where: { id: 'usr_creator_removed' } });
    expect(softDeletedUser).not.toBeNull();
    expect(softDeletedUser?.deletedAt).not.toBeNull();
  });

  it('rejects webhook request with tampered/invalid Svix signature returning HTTP 400 and mutating zero DB records', async () => {
    // Seed User to ensure DB state remains completely untouched
    await prisma.user.create({
      data: {
        id: 'usr_untouched',
        clerkId: 'clerk_untouched',
        email: 'untouched@test.com',
        displayName: 'Untouched User',
      },
    });

    const webhookPayload = {
      type: 'user.deleted',
      data: { id: 'clerk_untouched', deleted: true },
    };

    // Create valid headers then tamper with the signature
    const validHeaders = createSignedSvixHeaders(webhookPayload, 'msg_tampered');
    const tamperedHeaders = {
      ...validHeaders,
      'svix-signature': 'v1,invalid_tampered_signature_hash',
    };

    const res = await request(app.getHttpServer())
      .post('/api/v1/webhooks/clerk')
      .set(tamperedHeaders)
      .send(webhookPayload);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      data: null,
      errors: [
        {
          message: 'Invalid webhook signature',
          code: 'Bad Request',
        },
      ],
      meta: {
        statusCode: 400,
        timestamp: expect.any(String),
      },
    });

    // Assert zero DB mutations occurred in orbit_test
    const untouchedUser = await prisma.user.findUnique({ where: { id: 'usr_untouched' } });
    expect(untouchedUser).not.toBeNull();
    expect(untouchedUser?.deletedAt).toBeNull();
  });
});
