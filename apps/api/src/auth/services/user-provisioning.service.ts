import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserProvisioningService {
  private readonly logger = new Logger(UserProvisioningService.name);

  constructor(private readonly prisma: PrismaService) {}

  async provisionUserJit(clerkId: string, secretKey: string) {
    this.logger.log(`JIT Provisioning local user for Clerk ID: ${clerkId}`);

    let clerkUser;
    try {
      const clerkClient = createClerkClient({ secretKey });
      clerkUser = await clerkClient.users.getUser(clerkId);
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch user profile from Clerk API for ${clerkId}`, error);
      throw new ServiceUnavailableException(
        'Authentication service temporarily unavailable. Please retry.',
      );
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || `${clerkId}@clerk.user`;
    const firstName = clerkUser.firstName || '';
    const lastName = clerkUser.lastName || '';
    const displayName = `${firstName} ${lastName}`.trim() || clerkUser.username || email;
    const avatarUrl = clerkUser.imageUrl || null;

    try {
      return await this.prisma.user.upsert({
        where: { clerkId },
        update: {
          email,
          displayName,
          avatarUrl,
          deletedAt: null,
        },
        create: {
          clerkId,
          email,
          displayName,
          avatarUrl,
        },
        select: {
          id: true,
          clerkId: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          timezone: true,
        },
      });
    } catch (error: unknown) {
      const err = error as { code?: string; meta?: { target?: string[] } };
      if (
        err?.code === 'P2002' &&
        Array.isArray(err?.meta?.target) &&
        err.meta.target.includes('clerkId')
      ) {
        this.logger.warn(
          `P2002 race condition on clerkId during JIT provisioning for ${clerkId}. Re-fetching user.`,
        );
        const existingUser = await this.prisma.user.findUnique({
          where: { clerkId },
          select: {
            id: true,
            clerkId: true,
            email: true,
            displayName: true,
            avatarUrl: true,
            timezone: true,
          },
        });

        if (existingUser) {
          return existingUser;
        }
      }
      throw error;
    }
  }

  /**
   * Provisions a fixed dev user via Prisma only (no Clerk API calls).
   * Used exclusively when AUTH_MODE=dev_bypass.
   */
  async provisionDevUser() {
    this.logger.log('Provisioning fixed dev user (AUTH_MODE=dev_bypass)');

    return this.prisma.user.upsert({
      where: { clerkId: 'dev_user_orbit' },
      update: {
        deletedAt: null,
      },
      create: {
        clerkId: 'dev_user_orbit',
        email: 'dev@orbit.local',
        displayName: 'Dev User (Bypass)',
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        timezone: true,
      },
    });
  }
}
