import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PushNotificationService } from './push.service';
import { PushController } from './push.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [PushController],
  providers: [NotificationService, PushNotificationService],
  exports: [NotificationService, PushNotificationService],
})
export class NotificationModule {}
