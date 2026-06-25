import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { SchedulingConfig } from '../scheduling/scheduling.entity';
import { RecurringAvailability } from '../doctor/recurring-availability.entity';
import { CustomAvailability } from '../doctor/custom-availability.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      SchedulingConfig,
      RecurringAvailability,
      CustomAvailability,
    ]),
    NotificationModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}