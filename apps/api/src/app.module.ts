/**
 * BlueStay API - Root Application Module
 * 
 * Configures all modules, GraphQL, and global providers.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { join } from 'path';
import { Request, Response } from 'express';

// Core modules
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';

// Feature modules
import { HotelModule } from './modules/hotel/hotel.module';
import { RoomModule } from './modules/room/room.module';
import { BookingModule } from './modules/booking/booking.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

// Health check
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // GraphQL configuration with Apollo
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Auto-generate schema from resolvers
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        
        // Build schema options - register DateTime scalar
        buildSchemaOptions: {
          dateScalarMode: 'isoDate',
        },
        
        // Enable playground in development
        playground: configService.get('NODE_ENV') !== 'production',
        
        // Include stack traces in development
        debug: configService.get('NODE_ENV') !== 'production',
        
        // Context builder - extract tenant info from request
        context: ({ req, res }: { req: Request; res: Response }) => ({
          req,
          res,
          // Tenant context from middleware
          tenantType: req.headers['x-tenant-type'] || 'aggregator',
          tenantId: req.headers['x-tenant-id'] || 'bluestay',
          hotelId: req.headers['x-hotel-id'] || null,
        }),
        
        // Format errors for client
        formatError: (error) => {
          // In production, hide internal errors
          if (configService.get('NODE_ENV') === 'production') {
            // Log full error server-side
            console.error(error);
            
            // Return sanitized error to client
            return {
              message: error.message,
              code: error.extensions?.code || 'INTERNAL_ERROR',
            };
          }
          return error;
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 second
        limit: 10,    // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 10000,   // 10 seconds
        limit: 50,    // 50 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000,   // 1 minute
        limit: 200,   // 200 requests per minute
      },
    ]),

    // Core infrastructure modules
    PrismaModule,
    RedisModule,

    // Feature modules
    HotelModule,
    RoomModule,
    BookingModule,
    AuthModule,
    UserModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
