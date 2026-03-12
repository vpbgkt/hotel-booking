import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyResolver } from './api-key.resolver';

@Module({
  providers: [ApiKeyService, ApiKeyResolver],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
