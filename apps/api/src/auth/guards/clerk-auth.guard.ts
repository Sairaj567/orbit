import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '../../prisma/prisma.service';
import { UserProvisioningService } from '../services/user-provisioning.service';
import type { AuthenticatedRequest } from '../types';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly userProvisioningService: UserProvisioningService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // --- DEV BYPASS: skip all Clerk verification ---
    const authMode = this.configService.get<string>('AUTH_MODE');
    if (authMode === 'dev_bypass') {
      const devUser = await this.userProvisioningService.provisionDevUser();
      request.auth = {
        clerkId: 'dev_user_orbit',
        sessionId: 'dev_session',
        tokenType: 'dev',
      };
      request.user = devUser;
      return true;
    }
    // --- END DEV BYPASS ---

    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing Authorization Bearer token');
    }

    const secretKey =
      this.configService.get<string>('CLERK_SECRET_KEY') || process.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      throw new UnauthorizedException('Clerk secret key is not configured');
    }

    const payload = await this.verifyClerkToken(token, secretKey);
    const clerkId = typeof payload.sub === 'string' ? payload.sub : undefined;

    if (!clerkId) {
      throw new UnauthorizedException('Clerk token is missing a subject');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        timezone: true,
        deletedAt: true,
      },
    });

    if (dbUser?.deletedAt) {
      throw new UnauthorizedException('User account has been deleted');
    }

    const user = dbUser
      ? {
          id: dbUser.id,
          clerkId: dbUser.clerkId,
          email: dbUser.email,
          displayName: dbUser.displayName,
          avatarUrl: dbUser.avatarUrl,
          timezone: dbUser.timezone,
        }
      : await this.userProvisioningService.provisionUserJit(clerkId, secretKey);

    request.auth = {
      clerkId,
      sessionId: typeof payload.sid === 'string' ? payload.sid : undefined,
      tokenType: typeof payload.typ === 'string' ? payload.typ : undefined,
    };
    request.user = user;

    return true;
  }

  private extractBearerToken(header: string | undefined): string | undefined {
    if (!header) return undefined;

    const [scheme, token] = header.trim().split(/\s+/);
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return undefined;
    }

    return token;
  }

  private async verifyClerkToken(
    token: string,
    secretKey: string,
  ): Promise<Record<string, unknown>> {
    try {
      const payload = await verifyToken(token, { secretKey });
      return payload as Record<string, unknown>;
    } catch {
      throw new UnauthorizedException('Invalid or expired Clerk token');
    }
  }
}
