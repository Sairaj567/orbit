import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { UpdateUserInput } from '@orbit/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'usr_test1',
    clerkId: 'clerk_test1',
    email: 'user@test.com',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    timezone: 'UTC',
    preferences: { theme: 'dark', soundsEnabled: true },
    xp: 100,
    level: 2,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('returns user profile for a valid user ID', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await service.getUserProfile('usr_test1');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'usr_test1', deletedAt: null },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException if user is not found in database', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.getUserProfile('usr_nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserProfile', () => {
    it('updates displayName and timezone successfully and merges preferences JSON', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (prismaService.user.update as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        displayName: 'Updated Name',
        timezone: 'Europe/London',
        preferences: { theme: 'dark', soundsEnabled: true, notificationsEnabled: false },
      });

      const updateInput = {
        displayName: 'Updated Name',
        timezone: 'Europe/London',
        preferences: { notificationsEnabled: false },
      };

      const result = await service.updateUserProfile('usr_test1', updateInput);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'usr_test1' },
        data: {
          displayName: 'Updated Name',
          timezone: 'Europe/London',
          preferences: {
            theme: 'dark',
            soundsEnabled: true,
            notificationsEnabled: false,
          },
        },
        select: expect.any(Object),
      });
      expect(result.displayName).toBe('Updated Name');
      expect(result.timezone).toBe('Europe/London');
    });

    it('strips/ignores attempts to modify immutable or Clerk-managed fields (mass assignment check)', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (prismaService.user.update as jest.Mock).mockResolvedValueOnce(mockUser);

      const maliciousInput = {
        displayName: 'New Name',
        email: 'hacked@test.com',
        xp: 99999,
        level: 100,
        clerkId: 'hacked_clerk',
        avatarUrl: 'https://hacked.com/avatar.png',
      } as unknown as UpdateUserInput;

      await service.updateUserProfile('usr_test1', maliciousInput);

      // Verify data passed to prisma.user.update ONLY contains allowed fields
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'usr_test1' },
        data: {
          displayName: 'New Name',
        },
        select: expect.any(Object),
      });
    });
  });
});
