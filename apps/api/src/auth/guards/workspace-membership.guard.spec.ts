import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkspaceMembershipGuard } from './workspace-membership.guard';

describe('WorkspaceMembershipGuard', () => {
  let guard: WorkspaceMembershipGuard;
  let reflector: jest.Mocked<Reflector>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMembershipGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            workspace: {
              findFirst: jest.fn(),
            },
            workspaceMember: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    guard = module.get<WorkspaceMembershipGuard>(WorkspaceMembershipGuard);
    reflector = module.get(Reflector);
    prismaService = module.get(PrismaService);
  });

  function createMockExecutionContext(requestObject: Record<string, unknown>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => requestObject,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  }

  it('allows access on happy path when user meets workspace role decorator requirements', async () => {
    const req: Record<string, unknown> = {
      user: { id: 'usr_1' },
      params: { workspaceId: 'ws_123' },
      headers: {},
    };
    const context = createMockExecutionContext(req);

    const workspace = { id: 'ws_123', slug: 'demo', name: 'Demo Workspace' };
    const membership = { id: 'wm_1', role: 'ADMIN', userId: 'usr_1', workspaceId: 'ws_123' };

    (prismaService.workspace.findFirst as jest.Mock).mockResolvedValueOnce(workspace);
    (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(membership);
    reflector.getAllAndOverride.mockReturnValueOnce(['MEMBER', 'ADMIN']);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(req['workspace']).toEqual(workspace);
    expect(req['workspaceId']).toBe('ws_123');
    expect(req['workspaceMembership']).toEqual(membership);
  });

  it('throws UnauthorizedException when request.user is missing', async () => {
    const req = { params: { workspaceId: 'ws_123' } };
    const context = createMockExecutionContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authenticated user is required'),
    );
  });

  it('throws ForbiddenException when workspace ID or slug cannot be extracted from request', async () => {
    const req = { user: { id: 'usr_1' }, params: {}, headers: {} };
    const context = createMockExecutionContext(req);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Workspace ID or slug is required'),
    );
  });

  it('returns null from workspace.findFirst (due to deletedAt: null clause) for soft-deleted workspace and throws ForbiddenException', async () => {
    const req = { user: { id: 'usr_1' }, params: { workspaceId: 'ws_soft_deleted' }, headers: {} };
    const context = createMockExecutionContext(req);

    (prismaService.workspace.findFirst as jest.Mock).mockResolvedValueOnce(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Workspace not found or access denied'),
    );
    expect(prismaService.workspace.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ id: 'ws_soft_deleted' }, { slug: 'ws_soft_deleted' }],
        deletedAt: null,
      },
      select: expect.any(Object),
    });
  });

  it('returns identical ForbiddenException for non-member user and non-existent workspace (enumeration security)', async () => {
    const req = { user: { id: 'usr_non_member' }, params: { workspaceId: 'ws_123' }, headers: {} };
    const context = createMockExecutionContext(req);

    const workspace = { id: 'ws_123', slug: 'demo', name: 'Demo Workspace' };
    (prismaService.workspace.findFirst as jest.Mock).mockResolvedValueOnce(workspace);
    (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Workspace not found or access denied'),
    );
  });

  it('throws ForbiddenException when member role fails required decorator role rank', async () => {
    const req = { user: { id: 'usr_viewer' }, params: { workspaceId: 'ws_123' }, headers: {} };
    const context = createMockExecutionContext(req);

    const workspace = { id: 'ws_123', slug: 'demo', name: 'Demo Workspace' };
    const membership = {
      id: 'wm_viewer',
      role: 'VIEWER',
      userId: 'usr_viewer',
      workspaceId: 'ws_123',
    };

    (prismaService.workspace.findFirst as jest.Mock).mockResolvedValueOnce(workspace);
    (prismaService.workspaceMember.findFirst as jest.Mock).mockResolvedValueOnce(membership);
    reflector.getAllAndOverride.mockReturnValueOnce(['MEMBER', 'ADMIN']);

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Insufficient workspace role'),
    );
  });
});
