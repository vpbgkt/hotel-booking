import { Module } from '@nestjs/common';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import { PlatformAdminResolver } from './platform-admin.resolver';
import { PlatformAdminService } from './platform-admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [AdminResolver, AdminService, PlatformAdminResolver, PlatformAdminService],
  exports: [AdminService, PlatformAdminService],
})
export class AdminModule {}
