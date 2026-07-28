import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { registerSchema, loginSchema, changePasswordSchema, envelope } from '@orbit/shared';
import type { RegisterInput, LoginInput, ChangePasswordInput } from '@orbit/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthService } from './services/auth.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import type { AuthenticatedRequest } from './types';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setSessionCookie(res: Response, token: string) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie('orbit_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearSessionCookie(res: Response) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie('orbit_session', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() body: RegisterInput, @Res({ passthrough: true }) res: Response) {
    const session = await this.authService.register(body);
    this.setSessionCookie(res, session.token);
    return envelope({ success: true });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() body: LoginInput, @Res({ passthrough: true }) res: Response) {
    const session = await this.authService.login(body);
    this.setSessionCookie(res, session.token);
    return envelope({ success: true });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  async logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.orbit_session;
    if (token) {
      await this.authService.logout(token);
    }
    this.clearSessionCookie(res);
    return envelope({ success: true });
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  async logoutAll(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(req.user!.id);
    this.clearSessionCookie(res);
    return envelope({ success: true });
  }

  @Get('session')
  @UseGuards(SessionAuthGuard)
  async getSession(@Req() req: AuthenticatedRequest) {
    return envelope(req.user);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  @UsePipes(new ZodValidationPipe(changePasswordSchema))
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: ChangePasswordInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.changePassword(req.user!.id, body);
    this.clearSessionCookie(res); // Force re-login after password change
    return envelope({ success: true });
  }
}
