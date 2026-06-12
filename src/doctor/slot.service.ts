import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot, SlotStatus } from './slot.entity';
import { RecurringAvailability, DayOfWeek } from './recurring-availability.entity';
import { CustomAvailability } from './custom-availability.entity';
import { User } from '../users/user.entity';

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,
    @InjectRepository(RecurringAvailability)
    private recurringRepo: Repository<RecurringAvailability>,
    @InjectRepository(CustomAvailability)
    private customRepo: Repository<CustomAvailability>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private generateSlots(
    date: string,
    startTime: string,
    endTime: string,
    duration: number,
  ): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const slotStart = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`;
      current += duration;
      const slotEnd = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`;
      slots.push({ startTime: slotStart, endTime: slotEnd });
    }

    return slots;
  }

  async getSlots(doctorId: number, date: string, duration: number = 30) {
    if (!date) throw new BadRequestException('Date is required');

    if (isNaN(new Date(date).getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (duration <= 0) {
      throw new BadRequestException('Duration must be greater than 0');
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    if (selectedDate < today) {
      throw new BadRequestException('Cannot fetch slots for past dates');
    }

    // Check if doctor exists
    const doctor = await this.userRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Check custom availability first
    const customAvailability = await this.customRepo.findOne({
      where: { doctorId, date },
    });

    let availabilityWindows: { startTime: string; endTime: string }[] = [];

    if (customAvailability) {
      availabilityWindows = [{
        startTime: customAvailability.startTime,
        endTime: customAvailability.endTime,
      }];
    } else {
      // Use recurring availability
      const dayOfWeek = new Date(date)
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toUpperCase() as DayOfWeek;

      const recurring = await this.recurringRepo.find({
        where: { doctorId, dayOfWeek },
      });

      if (recurring.length === 0) {
        return { message: 'No availability for this date', slots: [] };
      }

      availabilityWindows = recurring.map((r) => ({
        startTime: r.startTime,
        endTime: r.endTime,
      }));
    }

    // Generate slots
    const now = new Date();
    const allSlots: { startTime: string; endTime: string }[] = [];

    for (const window of availabilityWindows) {
      const generated = this.generateSlots(date, window.startTime, window.endTime, duration);
      allSlots.push(...generated);
    }

    if (allSlots.length === 0) {
      return { message: 'No slots available', slots: [] };
    }

    // Filter out past slots
    const isToday = selectedDate.toDateString() === now.toDateString();
    const futureSlots = allSlots.filter((slot) => {
      if (!isToday) return true;
      const [h, m] = slot.startTime.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(h, m, 0, 0);
      return slotTime > now;
    });

    if (futureSlots.length === 0) {
      return { message: 'No future slots available', slots: [] };
    }

    return {
      doctorId,
      date,
      duration,
      totalSlots: futureSlots.length,
      slots: futureSlots,
    };
  }
}