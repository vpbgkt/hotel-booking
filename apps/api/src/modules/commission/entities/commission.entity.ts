import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class CommissionBooking {
  @Field() bookingNumber: string;
  @Field() guestName: string;
  @Field() checkInDate: Date;
  @Field({ nullable: true }) checkOutDate?: Date;
  @Field(() => Float) totalAmount: number;
  @Field() source: string;
  @Field() status: string;
}

@ObjectType()
export class CommissionHotel {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) city?: string;
}

@ObjectType()
export class CommissionRecord {
  @Field(() => ID) id: string;
  @Field() hotelId: string;
  @Field() bookingId: string;
  @Field(() => Float) bookingAmount: number;
  @Field(() => Float) commissionRate: number;
  @Field(() => Float) commissionAmount: number;
  @Field() status: string;
  @Field({ nullable: true }) settledAt?: Date;
  @Field() createdAt: Date;
  @Field(() => CommissionBooking, { nullable: true }) booking?: CommissionBooking;
  @Field(() => CommissionHotel, { nullable: true }) hotel?: CommissionHotel;
}

@ObjectType()
export class PaginatedCommissions {
  @Field(() => [CommissionRecord]) commissions: CommissionRecord[];
  @Field(() => Int) total: number;
  @Field(() => Int) page: number;
  @Field(() => Int) limit: number;
  @Field(() => Int) totalPages: number;
}

@ObjectType()
export class CommissionSummary {
  @Field(() => Float) totalCommission: number;
  @Field(() => Float) pendingCommission: number;
  @Field(() => Float) settledCommission: number;
  @Field(() => Float, { nullable: true }) disputedCommission?: number;
  @Field(() => Float) monthlyCommission: number;
  @Field(() => Float, { nullable: true }) lastMonthCommission?: number;
  @Field(() => Int, { nullable: true }) totalBookings?: number;
}

@ObjectType()
export class TopHotelCommission {
  @Field() hotelId: string;
  @Field() hotelName: string;
  @Field() city: string;
  @Field(() => Float) totalCommission: number;
}

@ObjectType()
export class PlatformCommissionSummary {
  @Field(() => Float) totalCommission: number;
  @Field(() => Float) totalBookingValue: number;
  @Field(() => Float) pendingCommission: number;
  @Field(() => Float) settledCommission: number;
  @Field(() => Float) monthlyCommission: number;
  @Field(() => [TopHotelCommission]) topHotels: TopHotelCommission[];
}

@ObjectType()
export class CommissionTrend {
  @Field() month: string;
  @Field(() => Float) totalBookingValue: number;
  @Field(() => Float) totalCommission: number;
  @Field(() => Int) bookingCount: number;
  @Field(() => Float) avgRate: number;
}

@ObjectType()
export class SettleResult {
  @Field(() => Int) settledCount: number;
  @Field() message: string;
}
