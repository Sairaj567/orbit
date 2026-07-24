import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedRequest } from '../types';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    const secretKey = this.configService.get<string>('clerk.secretKey');

    if (!secretKey) {
      throw new InternalServerErrorException('Clerk secret key is not configured');
    }

    const payload = await this.verifyClerkToken(token, secretKey);
    const clerkId = payload.sub;

    if (!clerkId) {
      throw new UnauthorizedException('Clerk token is missing a subject');
    }

    const user = await this.prisma.user.findUnique({
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

    if (!user) {
      throw new UnauthorizedException('Authenticated user has not been synced');
    }

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

    const [scheme, token] = header.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return undefined;
    }

    return token;
  }

  private async verifyClerkToken(token: string, secretKey: string) {
    try {
      return await verifyToken(token, { secretKey });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid Clerk token';
      throw new UnauthorizedException(message);
    }
  }
}
