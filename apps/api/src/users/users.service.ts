import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { UpdateUserInput } from '@orbit/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        clerkId: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        timezone: true,
        preferences: true,
        xp: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async updateUserProfile(userId: string, input: UpdateUserInput) {
    const existingUser = await this.getUserProfile(userId);

    const updatedPreferences =
      input.preferences !== undefined
        ? {
            ...((existingUser.preferences as Prisma.JsonObject) || {}),
            ...input.preferences,
          }
        : undefined;

    const dataToUpdate: Prisma.UserUpdateInput = {
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      ...(input.timezone !== undefined && { timezone: input.timezone }),
      ...(updatedPreferences !== undefined && {
        preferences: updatedPreferences as Prisma.InputJsonValue,
      }),
    };

    return await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        clerkId: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        timezone: true,
        preferences: true,
        xp: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
