import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { DoctorProfile } from './doctor-profile.entity';
import { RecurringAvailability } from './recurring-availability.entity';
import { CustomAvailability } from './custom-availability.entity';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile, RecurringAvailability, CustomAvailability])],
  controllers: [DoctorController, AvailabilityController],
  providers: [DoctorService, AvailabilityService],
})
export class DoctorModule {}