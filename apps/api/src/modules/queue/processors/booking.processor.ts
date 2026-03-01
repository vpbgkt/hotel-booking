/**
 * Booking Processor - BlueStay API
 * 
 * BullMQ worker that processes booking-related background jobs:
 * - Auto-cancel unpaid bookings after timeout
 * - Check-in reminders (1 day before)
 * - Post-checkout review requests
 * - Cleanup of expired bookings
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingJobData, QueueService } from '../queue.service';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
};

@Injectable()
export class BookingProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BookingProcessor.name);
  private worker: Worker<BookingJobData>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker<BookingJobData>(
      'booking-jobs',
      async (job: Job<BookingJobData>) => {
        switch (job.data.type) {
          case 'auto-cancel':
            return this.handleAutoCancel(job);
          case 'reminder':
            return this.handleReminder(job);
          case 'post-checkout-review':
            return this.handleReviewRequest(job);
          case 'cleanup-expired':
            return this.handleCleanupExpired(job);
          default:
            this.logger.warn(`Unknown booking job type: ${job.data.type}`);
        }
      },
      { connection: REDIS_CONNECTION, concurrency: 3 },
    );

    this.worker.on('completed', (job) => {
      this.logger.debug(`Booking job completed: ${job.data.type} ${job.data.bookingId || ''}`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Booking job failed: ${job?.data.type}: ${err.message}`);
    });

    this.logger.log('Booking processor started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }

  /**
   * Auto-cancel unpaid bookings after timeout
   */
  private async handleAutoCancel(job: Job<BookingJobData>) {
    const { bookingId } = job.data;
    if (!bookingId) return;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { guest: { select: { email: true, name: true } }, hotel: { select: { name: true } } },
    });

    if (!booking) return;

    // Only cancel if still pending payment
    if (booking.paymentStatus !== 'PENDING') {
      this.logger.debug(`Booking ${bookingId} already paid/cancelled, skipping auto-cancel`);
      return;
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        cancellationReason: 'Payment timeout - auto cancelled',
        cancelledAt: new Date(),
      },
    });

    // Send cancellation email
    if (booking.guest.email) {
      await this.queueService.sendEmail({
        to: booking.guest.email,
        subject: `Booking #${booking.bookingNumber} Cancelled - Payment Timeout`,
        template: 'booking-cancellation',
        data: {
          guestName: booking.guest.name,
          bookingNumber: booking.bookingNumber,
          hotelName: booking.hotel.name,
        },
      });
    }

    this.logger.log(`Auto-cancelled booking ${booking.bookingNumber} due to payment timeout`);
  }

  /**
   * Send check-in reminder 1 day before
   */
  private async handleReminder(job: Job<BookingJobData>) {
    const { bookingId } = job.data;
    if (!bookingId) return;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: { select: { email: true, name: true } },
        hotel: { select: { name: true, address: true, city: true, checkInTime: true } },
        roomType: { select: { name: true } },
      },
    });

    if (!booking || booking.status === 'CANCELLED') return;

    if (booking.guest.email) {
      await this.queueService.sendEmail({
        to: booking.guest.email,
        subject: `Reminder: Check-in tomorrow at ${booking.hotel.name}`,
        template: 'booking-confirmation',
        data: {
          guestName: booking.guest.name,
          hotelName: booking.hotel.name,
          bookingNumber: booking.bookingNumber,
          checkIn: new Date(booking.checkInDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
          checkOut: new Date(booking.checkOutDate || booking.checkInDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
          roomType: booking.roomType.name,
          amount: booking.totalAmount,
        },
      });
    }

    this.logger.log(`Check-in reminder sent for booking ${booking.bookingNumber}`);
  }

  /**
   * Send review request after checkout
   */
  private async handleReviewRequest(job: Job<BookingJobData>) {
    const { bookingId } = job.data;
    if (!bookingId) return;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guest: { select: { email: true, name: true } },
        hotel: { select: { name: true, slug: true } },
      },
    });

    if (!booking || booking.status === 'CANCELLED') return;

    // Check if review already exists
    const existingReview = await this.prisma.review.findFirst({
      where: { bookingId, guestId: booking.guestId },
    });

    if (existingReview) return;

    if (booking.guest.email) {
      await this.queueService.sendEmail({
        to: booking.guest.email,
        subject: `How was your stay at ${booking.hotel.name}?`,
        template: 'review-request',
        data: {
          guestName: booking.guest.name,
          hotelName: booking.hotel.name,
          reviewUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/booking/${bookingId}/review`,
        },
      });
    }

    this.logger.log(`Review request sent for booking ${booking.bookingNumber}`);
  }

  /**
   * Cleanup expired/unpaid bookings older than 1 hour
   */
  private async handleCleanupExpired(job: Job<BookingJobData>) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const expiredBookings = await this.prisma.booking.updateMany({
      where: {
        paymentStatus: 'PENDING',
        status: 'PENDING',
        createdAt: { lt: oneHourAgo },
      },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        cancellationReason: 'Expired - payment not completed',
        cancelledAt: new Date(),
      },
    });

    if (expiredBookings.count > 0) {
      this.logger.log(`Cleaned up ${expiredBookings.count} expired bookings`);
    }
  }
}
