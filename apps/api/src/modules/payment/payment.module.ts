/**
 * Payment Module - BlueStay API
 * Manages payment processing with abstractable gateway support.
 * Currently uses DEMO gateway. Real gateways (Razorpay/Stripe) 
 * can be plugged in later using the PaymentGatewayInterface.
 */

import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaymentService, PaymentResolver],
  exports: [PaymentService],
})
export class PaymentModule {}
