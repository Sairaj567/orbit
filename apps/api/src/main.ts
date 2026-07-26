import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(PinoLogger));

  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3001;
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters (order matters: most specific first)
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 Orbit API running on http://localhost:${port}`);
  logger.log(`📌 Health check: http://localhost:${port}/health`);
}

void bootstrap();
