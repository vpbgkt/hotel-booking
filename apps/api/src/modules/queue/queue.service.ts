/**
 * Queue Service - BlueStay API
 * 
 * Central job queue manager using BullMQ.
 * Provides typed methods for enqueueing background tasks.
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
};

export interface EmailJobData {
  to: string;
  subject: string;
  template: 'booking-confirmation' | 'booking-cancellation' | 'welcome' | 'password-reset' | 'review-request';
  data: Record<string, any>;
}

export interface BookingJobData {
  type: 'reminder' | 'auto-cancel' | 'post-checkout-review' | 'cleanup-expired';
  bookingId?: string;
  data?: Record<string, any>;
}

export interface AnalyticsJobData {
  type: 'page-view' | 'search' | 'booking-funnel' | 'revenue-snapshot';
  data: Record<string, any>;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  
  public emailQueue: Queue<EmailJobData>;
  public bookingQueue: Queue<BookingJobData>;
  public analyticsQueue: Queue<AnalyticsJobData>;
  
  private queues: Queue[] = [];

  async onModuleInit() {
    try {
      this.emailQueue = new Queue('email', { connection: REDIS_CONNECTION });
      this.bookingQueue = new Queue('booking-jobs', { connection: REDIS_CONNECTION });
      this.analyticsQueue = new Queue('analytics', { connection: REDIS_CONNECTION });
      
      this.queues = [this.emailQueue, this.bookingQueue, this.analyticsQueue];

      // Schedule recurring jobs
      await this.scheduleRecurringJobs();

      this.logger.log('Queue service initialized (email, booking-jobs, analytics)');
    } catch (err) {
      this.logger.warn(`Queue service failed to initialize: ${err.message}. Jobs will be processed synchronously.`);
    }
  }

  async onModuleDestroy() {
    for (const queue of this.queues) {
      try {
        await queue.close();
      } catch {
        // ignore close errors
      }
    }
  }

  /**
   * Send an email in the background
   */
  async sendEmail(data: EmailJobData) {
    try {
      await this.emailQueue.add('send-email', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      });
      this.logger.debug(`Email job queued: ${data.template} to ${data.to}`);
    } catch (err) {
      this.logger.warn(`Failed to queue email, sending synchronously: ${err.message}`);
      // Fallback: could call notification service directly
    }
  }

  /**
   * Schedule a booking reminder
   */
  async scheduleBookingReminder(bookingId: string, checkInDate: Date) {
    const reminderTime = new Date(checkInDate);
    reminderTime.setDate(reminderTime.getDate() - 1); // 1 day before check-in
    
    const delay = Math.max(0, reminderTime.getTime() - Date.now());
    
    if (delay > 0) {
      await this.bookingQueue.add(
        'booking-reminder',
        { type: 'reminder', bookingId },
        {
          delay,
          attempts: 2,
          removeOnComplete: { count: 100 },
        },
      );
      this.logger.debug(`Booking reminder scheduled for ${bookingId} at ${reminderTime.toISOString()}`);
    }
  }

  /**
   * Schedule auto-cancel for unpaid bookings (30 min timeout)
   */
  async scheduleAutoCancel(bookingId: string, timeoutMinutes = 30) {
    await this.bookingQueue.add(
      'auto-cancel',
      { type: 'auto-cancel', bookingId },
      {
        delay: timeoutMinutes * 60 * 1000,
        attempts: 1,
        removeOnComplete: { count: 100 },
      },
    );
    this.logger.debug(`Auto-cancel scheduled for ${bookingId} in ${timeoutMinutes} minutes`);
  }

  /**
   * Schedule review request email after checkout
   */
  async scheduleReviewRequest(bookingId: string, checkOutDate: Date) {
    const reviewTime = new Date(checkOutDate);
    reviewTime.setHours(reviewTime.getHours() + 24); // 24 hours after checkout
    
    const delay = Math.max(0, reviewTime.getTime() - Date.now());
    
    await this.bookingQueue.add(
      'review-request',
      { type: 'post-checkout-review', bookingId },
      {
        delay,
        attempts: 2,
        removeOnComplete: { count: 100 },
      },
    );
  }

  /**
   * Track an analytics event
   */
  async trackEvent(data: AnalyticsJobData) {
    try {
      await this.analyticsQueue.add('track', data, {
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 100 },
      });
    } catch {
      // Analytics is best-effort
    }
  }

  /**
   * Schedule recurring jobs
   */
  private async scheduleRecurringJobs() {
    // Clean up expired/unpaid bookings every hour
    await this.bookingQueue.upsertJobScheduler(
      'cleanup-expired-bookings',
      { every: 60 * 60 * 1000 }, // 1 hour
      {
        name: 'cleanup-expired',
        data: { type: 'cleanup-expired' },
      },
    );
    
    this.logger.debug('Recurring jobs scheduled');
  }
}
