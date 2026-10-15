import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulingConfig, SchedulingType, StreamSlot } from './scheduling.entity';
import { RecurringAvailability } from '../doctor/recurring-availability.entity';
import { CustomAvailability } from '../doctor/custom-availability.entity';

@Injectable()
export class SchedulingService {
  constructor(
    @InjectRepository(SchedulingConfig)
    private schedulingRepo: Repository<SchedulingConfig>,
    @InjectRepository(RecurringAvailability)
    private recurringRepo: Repository<RecurringAvailability>,
    @InjectRepository(CustomAvailability)
    private customRepo: Repository<CustomAvailability>,
  ) {}

  async setSchedulingConfig(doctorId: number, data: {
    schedulingType: SchedulingType;
    slotDuration?: number;
    bufferTime?: number;
    maxPatients?: number;
    allowFutureBooking?: boolean;
    maxFutureBookingDays?: number | null;
  }) {
    if (data.schedulingType === SchedulingType.STREAM) {
      if (!data.slotDuration || data.slotDuration <= 0) {
        throw new BadRequestException('Slot duration is required for STREAM scheduling');
      }
      if (data.bufferTime && data.bufferTime < 0) {
        throw new BadRequestException('Buffer time cannot be negative');
      }
    }

    if (data.schedulingType === SchedulingType.WAVE) {
      if (!data.maxPatients || data.maxPatients <= 0) {
        throw new BadRequestException('Max patients is required for WAVE scheduling');
      }
    }

    let config = await this.schedulingRepo.findOne({ where: { doctorId } });

    if (config) {
      config.schedulingType = data.schedulingType;
      if (data.slotDuration !== undefined) config.slotDuration = data.slotDuration;
      if (data.bufferTime !== undefined) config.bufferTime = data.bufferTime;
      if (data.maxPatients !== undefined) config.maxPatients = data.maxPatients;
      if (data.allowFutureBooking !== undefined) config.allowFutureBooking = data.allowFutureBooking;
      if ('maxFutureBookingDays' in data) {
        config.maxFutureBookingDays = data.maxFutureBookingDays ?? null;
      }
    } else {
      config = this.schedulingRepo.create({
        doctorId,
        schedulingType: data.schedulingType,
        slotDuration: data.slotDuration,
        bufferTime: data.bufferTime,
        maxPatients: data.maxPatients,
        allowFutureBooking: data.allowFutureBooking ?? false,
        maxFutureBookingDays: data.maxFutureBookingDays ?? null,
      } as SchedulingConfig);
    }

    return this.schedulingRepo.save(config);
  }

  async getSchedulingConfig(doctorId: number) {
    const config = await this.schedulingRepo.findOne({ where: { doctorId } });
    if (!config) throw new NotFoundException('Scheduling config not found');
    return config;
  }

  async getAvailableSlots(doctorId: number, date: string) {
    if (!date) throw new BadRequestException('Date is required');

    const config = await this.schedulingRepo.findOne({ where: { doctorId } });
    if (!config) throw new NotFoundException('Doctor scheduling config not found');

    const customOverride = await this.customRepo.findOne({
      where: { doctorId, date },
    });

    let availability: any = null;

    if (customOverride) {
      availability = customOverride;
    } else {
      const dayOfWeek = new Date(date)
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toUpperCase();

      const recurring = await this.recurringRepo.find({
        where: { doctorId, dayOfWeek: dayOfWeek as any },
      });

      if (recurring.length === 0) {
        return { message: 'No availability for this date', slots: [] };
      }

      availability = recurring[0];
    }

    if (config.schedulingType === SchedulingType.STREAM) {
      return this.generateStreamSlots(availability, config, date);
    } else {
      return this.generateWaveSlots(availability, config, date);
    }
  }

  private generateStreamSlots(availability: any, config: SchedulingConfig, date: string) {
    const slots: StreamSlot[] = [];
    const startTime = availability.startTime.substring(0, 5);
    const endTime = availability.endTime.substring(0, 5);

    let current = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const slotDuration = config.slotDuration;
    const bufferTime = config.bufferTime || 0;

    while (current + slotDuration <= end) {
      const slotStart = this.minutesToTime(current);
      const slotEnd = this.minutesToTime(current + slotDuration);
      slots.push({ date, startTime: slotStart, endTime: slotEnd, type: 'STREAM' });
      current += slotDuration + bufferTime;
    }

    return { type: 'STREAM', date, slots };
  }

  private generateWaveSlots(availability: any, config: SchedulingConfig, date: string) {
    const startTime = availability.startTime.substring(0, 5);
    const endTime = availability.endTime.substring(0, 5);

    return {
      type: 'WAVE',
      date,
      wave: {
        startTime,
        endTime,
        maxPatients: config.maxPatients,
        available: config.maxPatients,
      },
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}