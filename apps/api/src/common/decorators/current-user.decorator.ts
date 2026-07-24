import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Extracts the current authenticated user from the request.
 * The user object is populated by the auth guard.
 *
 * Usage:
 * ```ts
 * @Get('me')
 * getProfile(@CurrentUser() user: RequestUser) { ... }
 *
 * @Get('id')
 * getUserId(@CurrentUser('id') userId: string) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = (request as unknown as Record<string, unknown>).user;

    if (!user) return null;
    if (field) return (user as Record<string, unknown>)[field];
    return user;
  },
);

/** Shape of the user object attached to the request by the auth guard. */
export interface RequestUser {
  id: string;
  clerkId: string;
  email: string;
  displayName: string;
}
