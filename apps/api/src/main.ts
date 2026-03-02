/**
 * BlueStay API - Main Entry Point
 * 
 * NestJS backend serving both the aggregator (bluestay.in) 
 * and white-label hotel sites via GraphQL API.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { initSentry } from './sentry';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

// Initialize Sentry before anything else
initSentry();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Enable raw body for webhook signature verification (Razorpay)
    rawBody: true,
    // Enable logging in development
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn'] 
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BlueStay API')
    .setDescription(
      'Multi-tenant hotel booking platform API. ' +
      'Supports aggregator (bluestay.in) and white-label hotel frontends. ' +
      'Primary API is GraphQL at /graphql. REST endpoints are documented here.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addApiKey(
      { type: 'apiKey', name: 'x-hotel-id', in: 'header' },
      'HotelId',
    )
    .addApiKey(
      { type: 'apiKey', name: 'x-tenant-type', in: 'header' },
      'TenantType',
    )
    .addTag('Health', 'Health check endpoints')
    .addTag('Auth', 'Authentication & authorization')
    .addTag('Hotels', 'Hotel management')
    .addTag('Bookings', 'Booking operations')
    .addTag('Payments', 'Payment processing (Razorpay)')
    .addTag('Uploads', 'File upload management')
    .addTag('Webhooks', 'Payment webhook handlers')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'BlueStay API Docs',
  });

  // Security headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Response compression
  app.use(compression());

  // Static file serving for uploads
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });

  // Global prefix for REST endpoints (GraphQL is at /graphql)
  app.setGlobalPrefix('api', {
    exclude: ['graphql', 'health'], // Exclude GraphQL and health check
  });

  // Enable CORS for frontend domains
  app.enableCors({
    origin: [
      'http://localhost:3000',           // Local dev
      'https://bluestay.in',             // Production aggregator
      'https://www.bluestay.in',
      /\.bluestay\.in$/,                 // Subdomains
      // Hotel custom domains are added dynamically or via wildcard
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-hotel-id', 'x-tenant-type'],
  });

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true,           // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Sentry exception filter (captures 5xx errors)
  app.useGlobalFilters(new SentryExceptionFilter());

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 BlueStay API running on http://localhost:${port}`);
  console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
  console.log(`📖 Swagger API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
