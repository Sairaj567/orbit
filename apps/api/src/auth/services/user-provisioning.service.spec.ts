import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../../prisma/prisma.service';
import { UserProvisioningService } from './user-provisioning.service';

jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(),
}));

describe('UserProvisioningService', () => {
  let service: UserProvisioningService;
  let prismaService: jest.Mocked<PrismaService>;
  const mockGetUser = jest.fn();

  beforeEach(async () => {
    (createClerkClient as jest.Mock).mockReturnValue({
      users: {
        getUser: mockGetUser,
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProvisioningService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserProvisioningService>(UserProvisioningService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should provision a user successfully on happy path', async () => {
    const clerkId = 'user_clerk123';
    const secretKey = 'sec_key';

    mockGetUser.mockResolvedValueOnce({
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: 'https://example.com/avatar.png',
    });

    const expectedUser = {
      id: 'usr_1',
      clerkId,
      email: 'test@example.com',
      displayName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.png',
      timezone: 'UTC',
    };

    (prismaService.user.upsert as jest.Mock).mockResolvedValueOnce(expectedUser);

    const result = await service.provisionUserJit(clerkId, secretKey);

    expect(createClerkClient).toHaveBeenCalledWith({ secretKey });
    expect(mockGetUser).toHaveBeenCalledWith(clerkId);
    expect(prismaService.user.upsert).toHaveBeenCalledWith({
      where: { clerkId },
      update: {
        email: 'test@example.com',
        displayName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.png',
        deletedAt: null,
      },
      create: {
        clerkId,
        email: 'test@example.com',
        displayName: 'John Doe',
        avatarUrl: 'https://example.com/avatar.png',
      },
      select: expect.any(Object),
    });
    expect(result).toEqual(expectedUser);
  });

  it('should throw ServiceUnavailableException when Clerk API fails', async () => {
    mockGetUser.mockRejectedValueOnce(new Error('Clerk API rate limit / outage'));

    await expect(service.provisionUserJit('user_clerk123', 'sec_key')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('should recover from P2002 race condition on clerkId by re-fetching user', async () => {
    const clerkId = 'user_clerk123';
    mockGetUser.mockResolvedValueOnce({
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Jane',
      lastName: 'Doe',
    });

    const p2002Error = {
      code: 'P2002',
      meta: { target: ['clerkId'] },
    };
    (prismaService.user.upsert as jest.Mock).mockRejectedValueOnce(p2002Error);

    const existingUser = {
      id: 'usr_existing',
      clerkId,
      email: 'test@example.com',
      displayName: 'Jane Doe',
      avatarUrl: null,
      timezone: 'UTC',
    };
    (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(existingUser);

    const result = await service.provisionUserJit(clerkId, 'sec_key');

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId },
      select: expect.any(Object),
    });
    expect(result).toEqual(existingUser);
  });

  it('should rethrow P2002 error if target is not clerkId', async () => {
    mockGetUser.mockResolvedValueOnce({
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Jane',
      lastName: 'Doe',
    });

    const emailConflictError = {
      code: 'P2002',
      meta: { target: ['email'] },
    };
    (prismaService.user.upsert as jest.Mock).mockRejectedValueOnce(emailConflictError);

    await expect(service.provisionUserJit('user_clerk123', 'sec_key')).rejects.toEqual(
      emailConflictError,
    );
    expect(prismaService.user.findUnique).not.toHaveBeenCalled();
  });
});
