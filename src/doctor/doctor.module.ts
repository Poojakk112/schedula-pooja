import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { DoctorProfile } from './doctor-profile.entity';
import { RecurringAvailability } from './recurring-availability.entity';
import { CustomAvailability } from './custom-availability.entity';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { Slot } from './slot.entity';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { User } from '../users/user.entity';
import { Appointment } from '../appointment/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    DoctorProfile,
    RecurringAvailability,
    CustomAvailability,
    Slot,
    User,
    Appointment,
  ])],
  controllers: [DoctorController, AvailabilityController, SlotController],
  providers: [DoctorService, AvailabilityService, SlotService],
})
export class DoctorModule {}