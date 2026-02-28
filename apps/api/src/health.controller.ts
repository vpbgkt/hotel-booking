/**
 * Health Check Controller
 * 
 * Simple endpoint to verify API is running.
 * Used by load balancers and monitoring tools.
 */

import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'bluestay-api',
      version: '1.0.0',
    };
  }
}
