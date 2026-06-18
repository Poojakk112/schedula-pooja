import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringAvailability, DayOfWeek } from './recurring-availability.entity';
import { CustomAvailability } from './custom-availability.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(RecurringAvailability)
    private recurringRepo: Repository<RecurringAvailability>,
    @InjectRepository(CustomAvailability)
    private customRepo: Repository<CustomAvailability>,
  ) {}

  private async hasOverlap(
    doctorId: number,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<boolean> {
    const slots = await this.recurringRepo.find({ where: { doctorId, dayOfWeek } });
    return slots.some((slot) => {
      if (excludeId && slot.id === excludeId) return false;
      return slot.startTime < endTime && slot.endTime > startTime;
    });
  }

  async createRecurring(doctorId: number, data: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }) {
    if (data.startTime >= data.endTime) {
      throw new BadRequestException('End time must be after start time');
    }
    const overlap = await this.hasOverlap(doctorId, data.dayOfWeek, data.startTime, data.endTime);
    if (overlap) throw new BadRequestException('Time slot overlaps with existing availability');

    const slot = this.recurringRepo.create({ ...data, doctorId });
    return this.recurringRepo.save(slot);
  }

  async getRecurring(doctorId: number) {
    return this.recurringRepo.find({ where: { doctorId } });
  }

  async updateRecurring(doctorId: number, id: number, data: Partial<RecurringAvailability>) {
    const slot = await this.recurringRepo.findOne({ where: { id, doctorId } });
    if (!slot) throw new NotFoundException('Availability slot not found');

    if (data.startTime && data.endTime) {
      if (data.startTime >= data.endTime) {
        throw new BadRequestException('End time must be after start time');
      }
      const overlap = await this.hasOverlap(doctorId, slot.dayOfWeek, data.startTime, data.endTime, id);
      if (overlap) throw new BadRequestException('Time slot overlaps with existing availability');
    }

    Object.assign(slot, data);
    return this.recurringRepo.save(slot);
  }

  async deleteRecurring(doctorId: number, id: number) {
    const slot = await this.recurringRepo.findOne({ where: { id, doctorId } });
    if (!slot) throw new NotFoundException('Availability slot not found');
    await this.recurringRepo.remove(slot);
    return { message: 'Availability slot deleted successfully' };
  }

  async createOverride(doctorId: number, data: {
    date: string;
    startTime: string;
    endTime: string;
  }) {
    if (data.startTime >= data.endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const existing = await this.customRepo.findOne({
      where: { doctorId, date: data.date },
    });
    if (existing) throw new BadRequestException('Override already exists for this date');

    const override = this.customRepo.create({ ...data, doctorId });
    return this.customRepo.save(override);
  }

  async getAvailabilityByDate(doctorId: number, date: string) {
    if (!date) throw new BadRequestException('Date is required');

    const customOverride = await this.customRepo.findOne({
      where: { doctorId, date },
    });

    if (customOverride) {
      return { type: 'custom', data: customOverride };
    }

    const dayOfWeek = new Date(date)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toUpperCase() as DayOfWeek;

    const recurring = await this.recurringRepo.find({
      where: { doctorId, dayOfWeek },
    });

    if (recurring.length === 0) {
      return { message: 'No availability for this date', data: [] };
    }

    return { type: 'recurring', data: recurring };
  }
}