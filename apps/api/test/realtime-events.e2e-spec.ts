import type { AddressInfo } from 'net';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RealtimeService } from '../src/realtime/realtime.service';
import { AiService } from '../src/ai/ai.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { assertTestDatabaseSafety, resetTestDatabase } from './helpers/test-db-safety';
import { ensureNoEvent, waitForEvent } from './helpers/socket-test-helpers';

describe('Realtime Socket.IO E2E Integration (Real Server & Sockets)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let realtimeService: RealtimeService;
  let serverUrl: string;
  const clientSockets: Socket[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AiService)
      .useValue({
        embedEntity: jest.fn(),
        generateEmbedding: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    // Bind to a random free OS port for real WebSocket networking
    await app.listen(0);

    prisma = app.get<PrismaService>(PrismaService);
    realtimeService = app.get<RealtimeService>(RealtimeService);

    const address = app.getHttpServer().address() as AddressInfo;
    serverUrl = `http://localhost:${address.port}`;

    // Hard Safety Gate: Assert current database is orbit_test before executing tests
    await assertTestDatabaseSafety(prisma);
  });

  afterAll(async () => {
    for (const socket of clientSockets) {
      if (socket.connected) {
        socket.disconnect();
      }
    }
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await resetTestDatabase(prisma);
  });

  afterEach(() => {
    for (const socket of clientSockets) {
      if (socket.connected) {
        socket.disconnect();
      }
    }
    clientSockets.length = 0;
  });

  function createClientSocket(token: string): Socket {
    const socket = io(serverUrl, {
      extraHeaders: {
        cookie: `orbit_session=${token}`,
      },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    clientSockets.push(socket);
    return socket;
  }

  it('connects via real Socket.IO handshake auth, joins workspace room, and receives real server broadcast', async () => {
    // Seed User
    await prisma.user.create({
      data: {
        id: 'usr_rt_1',
        email: 'rt1@test.com',
        passwordHash: 'dummy_hash',
        displayName: 'Realtime User 1',
      },
    });

    // Seed Session
    await prisma.session.create({
      data: {
        id: 'session_rt_1',
        userId: 'usr_rt_1',
        token: 'valid_token_rt_1',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    // Seed Workspace & Active Membership
    await prisma.workspace.create({
      data: { id: 'ws_rt_1', name: 'RT Workspace 1', slug: 'rt-ws-1' },
    });

    await prisma.workspaceMember.create({
      data: {
        id: 'wm_rt_1',
        workspaceId: 'ws_rt_1',
        userId: 'usr_rt_1',
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    // 1. Connect real client socket with valid token and await server authentication completion
    const client = createClientSocket('valid_token_rt_1');
    await waitForEvent(client, 'connect');
    const authAck = await waitForEvent<{ userId: string }>(client, 'authenticated');
    expect(authAck.userId).toBe('usr_rt_1');

    // 2. Join workspace room and wait for deterministic acknowledgment event
    client.emit('join_workspace', { workspaceId: 'ws_rt_1' });
    const joinAck = await waitForEvent<{ workspaceId: string }>(client, 'joined_workspace');
    expect(joinAck.workspaceId).toBe('ws_rt_1');

    // 3. Trigger server-side broadcast via RealtimeService
    const broadcastPayload = { id: 'task_100', title: 'Live Realtime Task' };
    realtimeService.broadcast({
      workspaceId: 'ws_rt_1',
      event: 'task.created',
      payload: broadcastPayload,
    });

    // 4. Assert client receives real broadcast message over network socket
    const received = await waitForEvent<{
      workspaceId: string;
      event: string;
      payload: { id: string; title: string };
    }>(client, 'task.created');

    expect(received.workspaceId).toBe('ws_rt_1');
    expect(received.event).toBe('task.created');
    expect(received.payload).toEqual(broadcastPayload);
  });

  it('evicts user from workspace room and confirms zero subsequent broadcasts arrive', async () => {
    // Seed User
    await prisma.user.create({
      data: {
        id: 'usr_rt_evict',
        email: 'evict@test.com',
        passwordHash: 'dummy_hash',
        displayName: 'Evict User',
      },
    });

    // Seed Session
    await prisma.session.create({
      data: {
        id: 'session_rt_evict',
        userId: 'usr_rt_evict',
        token: 'valid_token_rt_evict',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    // Seed Workspace & Active Membership
    await prisma.workspace.create({
      data: { id: 'ws_rt_evict', name: 'Evict Workspace', slug: 'evict-ws' },
    });

    await prisma.workspaceMember.create({
      data: {
        id: 'wm_rt_evict',
        workspaceId: 'ws_rt_evict',
        userId: 'usr_rt_evict',
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    // 1. Connect client and await server authentication completion
    const client = createClientSocket('valid_token_rt_evict');
    await waitForEvent(client, 'connect');
    const authAck = await waitForEvent<{ userId: string }>(client, 'authenticated');
    expect(authAck.userId).toBe('usr_rt_evict');

    client.emit('join_workspace', { workspaceId: 'ws_rt_evict' });
    await waitForEvent(client, 'joined_workspace');

    // 2. Verify initial broadcast delivery works before eviction
    realtimeService.broadcast({
      workspaceId: 'ws_rt_evict',
      event: 'task.created',
      payload: { id: 'task_initial', title: 'Before Eviction' },
    });
    await waitForEvent(client, 'task.created');

    // 3. Evict user from workspace room
    await realtimeService.evictWorkspaceUser('ws_rt_evict', 'usr_rt_evict');

    // 4. Trigger second broadcast after eviction
    realtimeService.broadcast({
      workspaceId: 'ws_rt_evict',
      event: 'task.updated',
      payload: { id: 'task_initial', title: 'After Eviction' },
    });

    // 5. Assert client is evicted and receives zero further events
    await ensureNoEvent(client, 'task.updated', 500);
  });

  it('rejects connection attempt with invalid or tampered token and forcibly disconnects socket', async () => {
    // Connect socket with invalid token
    const client = createClientSocket('invalid_tampered_token');

    // Assert server disconnects unauthenticated socket attempt
    await waitForEvent(client, 'disconnect');
    expect(client.connected).toBe(false);
  });
});
