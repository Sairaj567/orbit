import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { verifyToken } from '@clerk/backend';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AiService } from '../src/ai/ai.service';
import { ActivityService } from '../src/activity/activity.service';
import { RealtimeService } from '../src/realtime/realtime.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { assertTestDatabaseSafety, resetTestDatabase } from './helpers/test-db-safety';

jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
}));

describe('Workspace Permissions (E2E Integration)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    (verifyToken as jest.Mock).mockImplementation(async (token: string) => {
      if (token === 'test_token_usr_viewer') return { sub: 'clerk_viewer' };
      if (token === 'test_token_usr_member') return { sub: 'clerk_member' };
      if (token === 'test_token_usr_stranger') return { sub: 'clerk_stranger' };
      throw new Error('Invalid test token');
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AiService)
      .useValue({
        embedEntity: jest.fn(),
        generateEmbedding: jest.fn(),
      })
      .overrideProvider(ActivityService)
      .useValue({
        recordActivity: jest.fn(),
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

    // Seed test users
    await prisma.user.createMany({
      data: [
        {
          id: 'usr_viewer',
          clerkId: 'clerk_viewer',
          email: 'viewer@test.com',
          displayName: 'Viewer User',
        },
        {
          id: 'usr_member',
          clerkId: 'clerk_member',
          email: 'member@test.com',
          displayName: 'Member User',
        },
        {
          id: 'usr_stranger',
          clerkId: 'clerk_stranger',
          email: 'stranger@test.com',
          displayName: 'Stranger User',
        },
      ],
    });

    // Seed test workspace
    await prisma.workspace.create({
      data: {
        id: 'ws_e2e',
        name: 'E2E Workspace',
        slug: 'e2e-workspace',
      },
    });

    // Seed workspace memberships
    await prisma.workspaceMember.createMany({
      data: [
        {
          id: 'wm_viewer',
          workspaceId: 'ws_e2e',
          userId: 'usr_viewer',
          role: 'VIEWER',
          status: 'ACTIVE',
        },
        {
          id: 'wm_member',
          workspaceId: 'ws_e2e',
          userId: 'usr_member',
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      ],
    });
  });

  it('blocks VIEWER user from creating unassigned task returning HTTP 403 (Epic 3 Bug E2E Verification)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/workspaces/ws_e2e/tasks')
      .set('Authorization', 'Bearer test_token_usr_viewer')
      .send({ title: 'Unassigned E2E Task' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      data: null,
      errors: [
        {
          message: 'You need at least MEMBER workspace access',
          code: 'Forbidden',
        },
      ],
      meta: {
        statusCode: 403,
        timestamp: expect.any(String),
      },
    });

    // Verify directly in real PostgreSQL orbit_test database that zero tasks were created
    const count = await prisma.task.count({ where: { workspaceId: 'ws_e2e' } });
    expect(count).toBe(0);
  });

  it('allows MEMBER user to create unassigned task returning HTTP 201 and enveloped response', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/workspaces/ws_e2e/tasks')
      .set('Authorization', 'Bearer test_token_usr_member')
      .send({ title: 'Unassigned E2E Task' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      data: expect.objectContaining({
        id: expect.any(String),
        title: 'Unassigned E2E Task',
        workspaceId: 'ws_e2e',
      }),
      errors: null,
    });

    // Verify task record exists in real PostgreSQL orbit_test database
    const dbTask = await prisma.task.findFirst({ where: { workspaceId: 'ws_e2e' } });
    expect(dbTask).not.toBeNull();
    expect(dbTask?.title).toBe('Unassigned E2E Task');
    expect(dbTask?.creatorId).toBe('usr_member');
  });

  it('returns identical HTTP 403 error envelopes for non-existent workspace and non-member user (enumeration security)', async () => {
    // Attempt A: Non-existent workspace ID with member account
    const resNonExistent = await request(app.getHttpServer())
      .post('/api/v1/workspaces/ws_nonexistent/tasks')
      .set('Authorization', 'Bearer test_token_usr_member')
      .send({ title: 'Test Task' });

    // Attempt B: Real workspace ID with stranger account (not a member)
    const resStranger = await request(app.getHttpServer())
      .post('/api/v1/workspaces/ws_e2e/tasks')
      .set('Authorization', 'Bearer test_token_usr_stranger')
      .send({ title: 'Test Task' });

    const expectedErrorEnvelope = {
      data: null,
      errors: [
        {
          message: 'Workspace not found or access denied',
          code: 'Forbidden',
        },
      ],
      meta: {
        statusCode: 403,
        timestamp: expect.any(String),
      },
    };

    expect(resNonExistent.status).toBe(403);
    expect(resNonExistent.body).toEqual(expectedErrorEnvelope);

    expect(resStranger.status).toBe(403);
    expect(resStranger.body).toEqual(expectedErrorEnvelope);
  });
});
