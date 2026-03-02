import { Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { CommissionResolver } from './commission.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [CommissionService, CommissionResolver],
  exports: [CommissionService],
})
export class CommissionModule {}
