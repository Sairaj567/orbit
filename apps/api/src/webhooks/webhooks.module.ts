import { Module } from '@nestjs/common';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  controllers: [ClerkWebhookController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
