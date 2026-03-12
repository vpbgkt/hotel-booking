import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyType, GeneratedApiKey, ApiKeyDeleteResult } from './entities/api-key.entity';
import { CreateApiKeyInput, UpdateApiKeyInput } from './dto/api-key.input';
import { GqlAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GqlCurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard, TenantGuard)
@Roles('HOTEL_ADMIN', 'PLATFORM_ADMIN')
export class ApiKeyResolver {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Mutation(() => GeneratedApiKey, {
    name: 'generateApiKey',
    description: 'Generate a new API key for a hotel. Returns the full key once — store it securely.',
  })
  async generateApiKey(
    @Args('input') input: CreateApiKeyInput,
    @GqlCurrentUser() user: any,
  ): Promise<GeneratedApiKey> {
    return this.apiKeyService.generateKey(input, user.id);
  }

  @Query(() => [ApiKeyType], {
    name: 'myApiKeys',
    description: 'List all API keys for the authenticated hotel',
  })
  async listApiKeys(
    @Args('hotelId', { type: () => ID }) hotelId: string,
  ): Promise<ApiKeyType[]> {
    return this.apiKeyService.listKeys(hotelId);
  }

  @Mutation(() => ApiKeyType, {
    name: 'updateApiKey',
    description: 'Update an API key\'s name, permissions, rate limit, or allowed origins',
  })
  async updateApiKey(
    @Args('input') input: UpdateApiKeyInput,
    @GqlCurrentUser() user: any,
  ): Promise<ApiKeyType> {
    return this.apiKeyService.updateKey(input, user.hotelId);
  }

  @Mutation(() => ApiKeyDeleteResult, {
    name: 'revokeApiKey',
    description: 'Deactivate an API key (reversible)',
  })
  async revokeApiKey(
    @Args('keyId', { type: () => ID }) keyId: string,
    @GqlCurrentUser() user: any,
  ): Promise<ApiKeyDeleteResult> {
    return this.apiKeyService.revokeKey(keyId, user.hotelId);
  }

  @Mutation(() => ApiKeyDeleteResult, {
    name: 'deleteApiKey',
    description: 'Permanently delete an API key',
  })
  async deleteApiKey(
    @Args('keyId', { type: () => ID }) keyId: string,
    @GqlCurrentUser() user: any,
  ): Promise<ApiKeyDeleteResult> {
    return this.apiKeyService.deleteKey(keyId, user.hotelId);
  }

  @Mutation(() => GeneratedApiKey, {
    name: 'rotateApiKey',
    description: 'Revoke an existing key and generate a new one with the same settings',
  })
  async rotateApiKey(
    @Args('keyId', { type: () => ID }) keyId: string,
    @GqlCurrentUser() user: any,
  ): Promise<GeneratedApiKey> {
    return this.apiKeyService.rotateKey(keyId, user.hotelId);
  }
}
