import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking, BookingResult, PaginatedBookings } from './entities/booking.entity';
import { 
  CreateDailyBookingInput, 
  CreateHourlyBookingInput,
  BookingFiltersInput,
  BookingPaginationInput,
  CancelBookingInput,
  UpdateBookingStatusInput,
} from './dto/create-booking.input';

// Note: Auth guards will be added when auth module is created
// import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Booking)
export class BookingResolver {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Create a daily booking
   */
  @Mutation(() => BookingResult, { 
    name: 'createDailyBooking', 
    description: 'Create a daily booking' 
  })
  async createDailyBooking(
    @Args('input') input: CreateDailyBookingInput,
    // @CurrentUser() user: any, // Will be added with auth
  ) {
    // Pass user ID when auth is implemented
    return this.bookingService.createDailyBooking(input);
  }

  /**
   * Create an hourly booking
   */
  @Mutation(() => BookingResult, { 
    name: 'createHourlyBooking', 
    description: 'Create an hourly booking' 
  })
  async createHourlyBooking(
    @Args('input') input: CreateHourlyBookingInput,
  ) {
    return this.bookingService.createHourlyBooking(input);
  }

  /**
   * Get booking by ID
   */
  @Query(() => Booking, { name: 'booking', description: 'Get booking by ID' })
  async getBookingById(
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.bookingService.getBookingById(id);
  }

  /**
   * Get booking by booking number
   */
  @Query(() => Booking, { 
    name: 'bookingByNumber', 
    description: 'Get booking by booking number' 
  })
  async getBookingByNumber(
    @Args('bookingNumber') bookingNumber: string,
  ) {
    return this.bookingService.getBookingByNumber(bookingNumber);
  }

  /**
   * List bookings with filters (for hotel dashboard)
   */
  @Query(() => PaginatedBookings, { 
    name: 'bookings', 
    description: 'List bookings with filters' 
  })
  async listBookings(
    @Args('filters', { nullable: true }) filters?: BookingFiltersInput,
    @Args('pagination', { nullable: true }) pagination?: BookingPaginationInput,
  ) {
    return this.bookingService.listBookings(filters, pagination);
  }

  /**
   * Cancel a booking
   */
  @Mutation(() => Booking, { 
    name: 'cancelBooking', 
    description: 'Cancel a booking' 
  })
  async cancelBooking(
    @Args('input') input: CancelBookingInput,
  ) {
    return this.bookingService.cancelBooking(input);
  }

  /**
   * Update booking status (for hotel staff)
   */
  @Mutation(() => Booking, { 
    name: 'updateBookingStatus', 
    description: 'Update booking status' 
  })
  async updateBookingStatus(
    @Args('input') input: UpdateBookingStatusInput,
  ) {
    return this.bookingService.updateBookingStatus(input);
  }
}
