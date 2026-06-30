import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus, SchedulingType } from './appointment.entity';
import { SchedulingConfig } from '../scheduling/scheduling.entity';
import { RecurringAvailability } from '../doctor/recurring-availability.entity';
import { CustomAvailability } from '../doctor/custom-availability.entity';
import { User } from '../users/user.entity';

@Injectable()
export class NextAvailableService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(SchedulingConfig)
    private schedulingRepo: Repository<SchedulingConfig>,
    @InjectRepository(RecurringAvailability)
    private recurringRepo: Repository<RecurringAvailability>,
    @InjectRepository(CustomAvailability)
    private customRepo: Repository<CustomAvailability>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private timeToMinutes(time: string): number {
    const t = time.substring(0, 5);
    const [hours, minutes] = t.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private async getAvailabilityForDate(doctorId: number, date: string) {
    const custom = await this.customRepo.findOne({ where: { doctorId, date } });
    if (custom) return custom;

    const dayOfWeek = new Date(date)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toUpperCase();

    const recurring = await this.recurringRepo.find({
      where: { doctorId, dayOfWeek: dayOfWeek as any },
    });

    return recurring.length > 0 ? recurring[0] : null;
  }

  private async getStreamSlots(doctorId: number, date: string, config: SchedulingConfig) {
    const availability = await this.getAvailabilityForDate(doctorId, date);
    if (!availability) return [];

    const slots: { startTime: string; endTime: string }[] = [];
    const startTime = availability.startTime.substring(0, 5);
    const endTime = availability.endTime.substring(0, 5);

    let current = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const slotDuration = config.slotDuration;
    const bufferTime = config.bufferTime || 0;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = date === todayStr;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    while (current + slotDuration <= end) {
      const slotStart = this.minutesToTime(current);
      const slotEnd = this.minutesToTime(current + slotDuration);

      const isPast = isToday && current <= nowMinutes;

      if (!isPast) {
        const taken = await this.appointmentRepo.findOne({
          where: {
            doctorId,
            date,
            startTime: slotStart,
            status: AppointmentStatus.BOOKED,
          },
        });

        if (!taken) {
          slots.push({ startTime: slotStart, endTime: slotEnd });
        }
      }

      current += slotDuration + bufferTime;
    }

    return slots;
  }

  private async getWaveAvailability(doctorId: number, date: string, config: SchedulingConfig) {
    const availability = await this.getAvailabilityForDate(doctorId, date);
    if (!availability) return null;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = date === todayStr;

    if (isToday) {
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const endMinutes = this.timeToMinutes(availability.endTime.substring(0, 5));
      if (nowMinutes >= endMinutes) return null;
    }

    const bookedCount = await this.appointmentRepo.count({
      where: {
        doctorId,
        date,
        status: AppointmentStatus.BOOKED,
        schedulingType: SchedulingType.WAVE,
      },
    });

    if (bookedCount >= config.maxPatients) return null;

    return {
      startTime: availability.startTime.substring(0, 5),
      endTime: availability.endTime.substring(0, 5),
      availableCapacity: config.maxPatients - bookedCount,
      totalCapacity: config.maxPatients,
    };
  }

  async findNextAvailable(doctorId: number) {
    if (!doctorId || isNaN(doctorId)) {
      throw new BadRequestException('Invalid doctor ID');
    }

    const doctor = await this.userRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const config = await this.schedulingRepo.findOne({ where: { doctorId } });
    if (!config) throw new NotFoundException('Doctor scheduling configuration not found');

    if (
      config.schedulingType !== SchedulingType.STREAM &&
      config.schedulingType !== SchedulingType.WAVE
    ) {
      throw new BadRequestException('Invalid scheduling type configured for this doctor');
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (config.schedulingType === SchedulingType.STREAM) {
      const todaySlots = await this.getStreamSlots(doctorId, todayStr, config);
      if (todaySlots.length > 0) {
        return {
          date: todayStr,
          type: 'STREAM',
          slots: todaySlots,
          message: 'Slots available today!',
        };
      }
    } else {
      const todayWave = await this.getWaveAvailability(doctorId, todayStr, config);
      if (todayWave) {
        return {
          date: todayStr,
          type: 'WAVE',
          wave: todayWave,
          message: 'Wave available today!',
        };
      }
    }


    // Search next 30 days
    for (let i = 1; i <= 30; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      if (config.schedulingType === SchedulingType.STREAM) {
        const slots = await this.getStreamSlots(doctorId, nextDateStr, config);
        if (slots.length > 0) {
          return {
            date: nextDateStr,
            type: 'STREAM',
            slots,
            message: `Next available appointment on ${nextDateStr}`,
          };
        }
      } else {
        const wave = await this.getWaveAvailability(doctorId, nextDateStr, config);
        if (wave) {
          return {
            date: nextDateStr,
            type: 'WAVE',
            wave,
            message: `Next available appointment on ${nextDateStr}`,
          };
        }
      }
    }

    return {
      message: 'No appointments available in the next 30 working days. Please try again later.',
      data: null,
    };
  }
}