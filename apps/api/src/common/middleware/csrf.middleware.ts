import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Skip CSRF for endpoints that are inherently safe or authenticate via non-session means
    const exemptPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/webhooks'];
    if (exemptPaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    // 2. Safe methods don't need CSRF protection
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      this.ensureCsrfCookie(req, res);
      return next();
    }

    // 3. For unsafe methods, validate the CSRF token
    const tokenFromCookie = req.cookies?.csrf_token;
    const tokenFromHeader = req.headers['x-csrf-token'];

    if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    next();
  }

  private ensureCsrfCookie(req: Request, res: Response) {
    if (!req.cookies?.csrf_token) {
      const token = randomBytes(32).toString('hex');
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('csrf_token', token, {
        httpOnly: false, // Must be readable by frontend JS to send back in header
        secure: isProd,
        sameSite: 'lax',
        path: '/',
      });
    }
  }
}
