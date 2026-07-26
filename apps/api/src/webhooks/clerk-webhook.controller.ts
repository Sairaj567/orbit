import {
  BadRequestException,
  Controller,
  Headers,
  Logger,
  Post,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly webhooksService: WebhooksService,
  ) {}

  @Post('clerk')
  async handleClerkWebhook(
    @Req() req: Request,
    @Headers('svix-id') svixId?: string,
    @Headers('svix-timestamp') svixTimestamp?: string,
    @Headers('svix-signature') svixSignature?: string,
  ) {
    const webhookSecret = this.configService.get<string>('clerk.webhookSecret');

    if (!webhookSecret) {
      this.logger.warn('Clerk webhook endpoint hit but CLERK_WEBHOOK_SECRET is not configured.');
      throw new ServiceUnavailableException(
        'Clerk webhook endpoint disabled: CLERK_WEBHOOK_SECRET not configured',
      );
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing Svix headers');
    }

    const payload = (req as Request & { rawBody?: Buffer }).rawBody || JSON.stringify(req.body);

    let evt: { type: string; data: Record<string, unknown> };
    try {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as { type: string; data: Record<string, unknown> };
    } catch (err: unknown) {
      this.logger.error('Failed to verify Clerk webhook signature', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    const eventType = evt.type;
    this.logger.log(`Received verified Clerk webhook event: ${eventType}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      await this.webhooksService.handleUserCreatedOrUpdated(evt.data);
    } else if (eventType === 'user.deleted') {
      await this.webhooksService.handleUserDeleted(evt.data);
    }

    return { success: true };
  }
}
