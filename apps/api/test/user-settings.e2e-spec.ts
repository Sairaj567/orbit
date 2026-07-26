import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AiService } from '../src/ai/ai.service';
import { RealtimeService } from '../src/realtime/realtime.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { assertTestDatabaseSafety, resetTestDatabase } from './helpers/test-db-safety';

jest.mock('@clerk/backend', () => {
  const original = jest.requireActual('@clerk/backend');
  return {
    ...original,
    verifyToken: jest.fn().mockImplementation(async (token: string) => {
      if (token && token.startsWith('valid_token_')) {
        const clerkId = token.replace('valid_token_', 'clerk_');
        return { sub: clerkId };
      }
      throw new Error('Invalid or expired Clerk token');
    }),
  };
});

describe('User Settings E2E Integration (/api/v1/users/me)', () => {
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

  it('GET /api/v1/users/me returns enveloped profile matching seeded orbit_test database record', async () => {
    // Seed User
    await prisma.user.create({
      data: {
        id: 'usr_me_1',
        clerkId: 'clerk_me_1',
        email: 'me1@test.com',
        displayName: 'Initial Profile Name',
        timezone: 'America/New_York',
        xp: 250,
        level: 3,
      },
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer valid_token_me_1');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(
      expect.objectContaining({
        id: 'usr_me_1',
        clerkId: 'clerk_me_1',
        email: 'me1@test.com',
        displayName: 'Initial Profile Name',
        timezone: 'America/New_York',
        xp: 250,
        level: 3,
      }),
    );
  });

  it('PATCH /api/v1/users/me updates displayName and timezone, persisting changes in orbit_test DB', async () => {
    // Seed User
    await prisma.user.create({
      data: {
        id: 'usr_me_2',
        clerkId: 'clerk_me_2',
        email: 'me2@test.com',
        displayName: 'Original Name',
        timezone: 'UTC',
      },
    });

    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer valid_token_me_2')
      .send({
        displayName: 'Updated Profile Name',
        timezone: 'Europe/London',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.displayName).toBe('Updated Profile Name');
    expect(res.body.data.timezone).toBe('Europe/London');

    // Real DB Persistence Check in orbit_test
    const updatedDbUser = await prisma.user.findUnique({ where: { id: 'usr_me_2' } });
    expect(updatedDbUser?.displayName).toBe('Updated Profile Name');
    expect(updatedDbUser?.timezone).toBe('Europe/London');
  });

  it('PATCH /api/v1/users/me rejects invalid empty displayName with HTTP 400 from ZodValidationPipe', async () => {
    // Seed User
    await prisma.user.create({
      data: {
        id: 'usr_me_3',
        clerkId: 'clerk_me_3',
        email: 'me3@test.com',
        displayName: 'Valid Name',
      },
    });

    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer valid_token_me_3')
      .send({
        displayName: '   ',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      {
        message: 'Validation failed',
        code: 'ERROR',
      },
    ]);
  });

  it('PATCH /api/v1/users/me strips unallowed email, xp, level, and clerkId fields (mass-assignment protection check)', async () => {
    // Seed User
    await prisma.user.create({
      data: {
        id: 'usr_me_4',
        clerkId: 'clerk_me_4',
        email: 'original@test.com',
        displayName: 'Safe Name',
        xp: 100,
        level: 1,
      },
    });

    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer valid_token_me_4')
      .send({
        displayName: 'Legit New Name',
        email: 'hacked@test.com',
        xp: 99999,
        level: 100,
        clerkId: 'clerk_hacked',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.displayName).toBe('Legit New Name');
    expect(res.body.data.email).toBe('original@test.com');
    expect(res.body.data.xp).toBe(100);
    expect(res.body.data.level).toBe(1);

    // Real DB Protection Check in orbit_test
    const dbUser = await prisma.user.findUnique({ where: { id: 'usr_me_4' } });
    expect(dbUser?.displayName).toBe('Legit New Name');
    expect(dbUser?.email).toBe('original@test.com');
    expect(dbUser?.xp).toBe(100);
    expect(dbUser?.level).toBe(1);
    expect(dbUser?.clerkId).toBe('clerk_me_4');
  });

  it('GET /api/v1/users/me rejects soft-deleted user returning HTTP 401 Unauthorized from ClerkAuthGuard', async () => {
    // Seed Soft-Deleted User
    await prisma.user.create({
      data: {
        id: 'usr_me_deleted',
        clerkId: 'clerk_me_deleted',
        email: 'deleted@test.com',
        displayName: 'Deleted User',
        deletedAt: new Date(),
      },
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer valid_token_me_deleted');

    expect(res.status).toBe(401);
    expect(res.body.errors[0].message).toBe('User account has been deleted');
  });
});
