import { Resolver, Query, Mutation, Args, ID, Int, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommissionService } from './commission.service';
import {
  PaginatedCommissions,
  CommissionSummary,
  PlatformCommissionSummary,
  CommissionTrend,
  CommissionRecord,
  SettleResult,
} from './entities/commission.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver()
export class CommissionResolver {
  constructor(private readonly commissionService: CommissionService) {}

  // ============================================
  // Hotel Admin Queries
  // ============================================

  @Query(() => PaginatedCommissions, {
    name: 'hotelCommissions',
    description: 'Get commission records for a hotel',
  })
  @UseGuards(JwtAuthGuard)
  async getHotelCommissions(
    @Args('hotelId', { type: () => ID }) hotelId: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page?: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit?: number,
  ) {
    return this.commissionService.getHotelCommissions(hotelId, {
      status,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  @Query(() => CommissionSummary, {
    name: 'hotelCommissionSummary',
    description: 'Get commission summary for a hotel',
  })
  @UseGuards(JwtAuthGuard)
  async getHotelCommissionSummary(
    @Args('hotelId', { type: () => ID }) hotelId: string,
  ) {
    return this.commissionService.getHotelCommissionSummary(hotelId);
  }

  // ============================================
  // Platform Admin Queries
  // ============================================

  @Query(() => PaginatedCommissions, {
    name: 'platformCommissions',
    description: 'Get all commissions across the platform',
  })
  @UseGuards(JwtAuthGuard)
  async getPlatformCommissions(
    @Args('hotelId', { type: () => ID, nullable: true }) hotelId?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page?: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit?: number,
  ) {
    return this.commissionService.getPlatformCommissions({
      hotelId,
      status,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  @Query(() => PlatformCommissionSummary, {
    name: 'platformCommissionSummary',
    description: 'Get platform-wide commission summary',
  })
  @UseGuards(JwtAuthGuard)
  async getPlatformCommissionSummary() {
    return this.commissionService.getPlatformCommissionSummary();
  }

  @Query(() => [CommissionTrend], {
    name: 'commissionTrends',
    description: 'Get monthly commission trends',
  })
  @UseGuards(JwtAuthGuard)
  async getCommissionTrends(
    @Args('hotelId', { type: () => ID, nullable: true }) hotelId?: string,
    @Args('months', { type: () => Int, nullable: true, defaultValue: 12 }) months?: number,
  ) {
    return this.commissionService.getCommissionTrends(hotelId, months);
  }

  // ============================================
  // Platform Admin Mutations
  // ============================================

  @Mutation(() => SettleResult, {
    name: 'settleCommissions',
    description: 'Settle pending commissions for a hotel',
  })
  @UseGuards(JwtAuthGuard)
  async settleCommissions(
    @Args('hotelId', { type: () => ID }) hotelId: string,
    @Args('commissionIds', { type: () => [ID], nullable: true }) commissionIds?: string[],
  ) {
    return this.commissionService.settleCommissions(hotelId, commissionIds);
  }

  @Mutation(() => CommissionRecord, {
    name: 'disputeCommission',
    description: 'Mark a commission as disputed',
  })
  @UseGuards(JwtAuthGuard)
  async disputeCommission(
    @Args('commissionId', { type: () => ID }) commissionId: string,
    @Args('reason') reason: string,
  ) {
    return this.commissionService.disputeCommission(commissionId, reason);
  }

  @Mutation(() => CommissionRecord, {
    name: 'resolveDispute',
    description: 'Resolve a disputed commission',
  })
  @UseGuards(JwtAuthGuard)
  async resolveDispute(
    @Args('commissionId', { type: () => ID }) commissionId: string,
    @Args('resolution') resolution: 'SETTLE' | 'WAIVE',
  ) {
    return this.commissionService.resolveDispute(commissionId, resolution);
  }

  @Mutation(() => CommissionRecord, {
    name: 'updateHotelCommissionRate',
    description: 'Update commission rate for a hotel',
  })
  @UseGuards(JwtAuthGuard)
  async updateHotelCommissionRate(
    @Args('hotelId', { type: () => ID }) hotelId: string,
    @Args('rate', { type: () => Float }) rate: number,
    @Args('type', { nullable: true, defaultValue: 'PERCENTAGE' }) type?: string,
  ) {
    return this.commissionService.updateHotelCommissionRate(
      hotelId,
      rate,
      type as 'PERCENTAGE' | 'FLAT',
    );
  }
}
