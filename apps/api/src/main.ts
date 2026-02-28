/**
 * BlueStay API - Main Entry Point
 * 
 * NestJS backend serving both the aggregator (bluestay.in) 
 * and white-label hotel sites via GraphQL API.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Enable logging in development
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn'] 
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

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

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 BlueStay API running on http://localhost:${port}`);
  console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
}

bootstrap();
