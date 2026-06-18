import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
<<<<<<< HEAD
import { Appointment, AppointmentStatus } from './appointment.entity';
import { User } from '../users/user.entity';
=======
import { Appointment, AppointmentStatus, SchedulingType } from './appointment.entity';
import { SchedulingConfig } from '../scheduling/scheduling.entity';
import { RecurringAvailability } from '../doctor/recurring-availability.entity';
import { CustomAvailability } from '../doctor/custom-availability.entity';
>>>>>>> 23d114f (feat: add appointment rescheduling with 30min cutoff and next slot suggestion)

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
<<<<<<< HEAD
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async bookAppointment(
    patientId: number,
    data: {
      doctorId: number;
      date: string;
      startTime: string;
      endTime: string;
    },
  ) {
    // Check doctor exists
    const doctor = await this.userRepo.findOne({ where: { id: data.doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Check future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(data.date);
    if (appointmentDate < today) {
      throw new BadRequestException('Cannot book appointment for past date');
    }

    // Check future time if today
    if (appointmentDate.toDateString() === new Date().toDateString()) {
      const [h, m] = data.startTime.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(h, m, 0, 0);
      if (slotTime <= new Date()) {
        throw new BadRequestException('Cannot book appointment for past time');
      }
    }

    // Check duplicate booking
=======
    @InjectRepository(SchedulingConfig)
    private schedulingRepo: Repository<SchedulingConfig>,
    @InjectRepository(RecurringAvailability)
    private recurringRepo: Repository<RecurringAvailability>,
    @InjectRepository(CustomAvailability)
    private customRepo: Repository<CustomAvailability>,
  ) {}

  private isWithin30Minutes(date: string, startTime: string): boolean {
    const appointmentDateTime = new Date(`${date}T${startTime}`);
    const now = new Date();
    const diffMs = appointmentDateTime.getTime() - now.getTime();
    const diffMins = diffMs / (1000 * 60);
    return diffMins < 30;
  }

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

  async bookAppointment(patientId: number, data: {
    doctorId: number;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const config = await this.schedulingRepo.findOne({ where: { doctorId: data.doctorId } });
    if (!config) throw new NotFoundException('Doctor scheduling config not found');

    const appointmentDate = new Date(`${data.date}T${data.startTime}`);
    if (appointmentDate < new Date()) {
      throw new BadRequestException('Cannot book appointment in the past');
    }

    if (config.schedulingType === SchedulingType.STREAM) {
      return this.bookStreamAppointment(patientId, data, config);
    } else {
      return this.bookWaveAppointment(patientId, data, config);
    }
  }

  private async bookStreamAppointment(patientId: number, data: any, config: SchedulingConfig) {
>>>>>>> 23d114f (feat: add appointment rescheduling with 30min cutoff and next slot suggestion)
    const existing = await this.appointmentRepo.findOne({
      where: {
        doctorId: data.doctorId,
        date: data.date,
        startTime: data.startTime,
        status: AppointmentStatus.BOOKED,
      },
    });
<<<<<<< HEAD
    if (existing) throw new BadRequestException('Slot already booked');
=======

    if (existing) {
      const suggestion = await this.suggestNextStreamSlot(data.doctorId, data.date, data.startTime, config);
      return {
        message: 'Slot already booked',
        suggestion,
      };
    }
>>>>>>> 23d114f (feat: add appointment rescheduling with 30min cutoff and next slot suggestion)

    const appointment = this.appointmentRepo.create({
      ...data,
      patientId,
      status: AppointmentStatus.BOOKED,
<<<<<<< HEAD
=======
      schedulingType: SchedulingType.STREAM,
    });

    return this.appointmentRepo.save(appointment);
  }

  private async bookWaveAppointment(patientId: number, data: any, config: SchedulingConfig) {
    const bookedCount = await this.appointmentRepo.count({
      where: {
        doctorId: data.doctorId,
        date: data.date,
        status: AppointmentStatus.BOOKED,
        schedulingType: SchedulingType.WAVE,
      },
    });

    if (bookedCount >= config.maxPatients) {
      const suggestion = await this.suggestNextWaveSlot(data.doctorId, data.date, config);
      return {
        message: 'Wave is full',
        suggestion,
      };
    }

    const tokenNumber = bookedCount + 1;

    const appointment = this.appointmentRepo.create({
      ...data,
      patientId,
      status: AppointmentStatus.BOOKED,
      schedulingType: SchedulingType.WAVE,
      tokenNumber,
>>>>>>> 23d114f (feat: add appointment rescheduling with 30min cutoff and next slot suggestion)
    });

    return this.appointmentRepo.save(appointment);
  }

  async getPatientAppointments(patientId: number) {
<<<<<<< HEAD
    const appointments = await this.appointmentRepo.find({
      where: { patientId },
     relations: { doctor: true },
      order: { date: 'ASC' },
    });

    if (appointments.length === 0) {
      return { message: 'No appointments found', data: [] };
    }

    return appointments;
  }

  async cancelAppointment(patientId: number, appointmentId: number) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.patientId !== patientId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment already cancelled');
    }

    // Check if past appointment
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.date);
    if (appointmentDate < today) {
      throw new BadRequestException('Cannot cancel past appointment');
=======
    return this.appointmentRepo.find({
      where: { patientId },
      relations: { doctor: true },
    });
  }

  async getDoctorAppointments(doctorId: number) {
    return this.appointmentRepo.find({
      where: { doctorId },
      relations: { patient: true },
    });
  }

  async cancelAppointment(patientId: number, id: number) {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.patientId !== patientId) throw new ForbiddenException('Unauthorized');
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment already cancelled');
    }
    if (this.isWithin30Minutes(appointment.date, appointment.startTime)) {
      throw new BadRequestException('Cannot cancel appointment within 30 minutes of start time');
>>>>>>> 23d114f (feat: add appointment rescheduling with 30min cutoff and next slot suggestion)
    }

    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appointment);
  }

<<<<<<< HEAD
  async getDoctorAppointments(doctorId: number) {
    const appointments = await this.appointmentRepo.find({
      where: { doctorId },
      relations: { patient: true },
      order: { date: 'ASC' },
    });

    if (appointments.length === 0) {
      return { message: 'No appointments found', data: [] };
    }

    return appointments;
=======
  async rescheduleAppointment(patientId: number, id: number, data: {
    date: string;
    startTime: string;
    endTime: string;
  }) {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.patientId !== patientId) throw new ForbiddenException('Unauthorized');
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot reschedule cancelled appointment');
    }

    if (this.isWithin30Minutes(appointment.date, appointment.startTime)) {
      throw new BadRequestException('Cannot reschedule appointment within 30 minutes of start time');
    }

    if (appointment.date === data.date && appointment.startTime.substring(0, 5) === data.startTime) {
      throw new BadRequestException('New slot is same as current slot');
    }

    const newDateTime = new Date(`${data.date}T${data.startTime}`);
    if (newDateTime < new Date()) {
      throw new BadRequestException('Cannot reschedule to past time');
    }

    const config = await this.schedulingRepo.findOne({ where: { doctorId: appointment.doctorId } });
    if (!config) throw new NotFoundException('Doctor scheduling config not found');

    if (config.schedulingType === SchedulingType.STREAM) {
      const slotTaken = await this.appointmentRepo.findOne({
        where: {
          doctorId: appointment.doctorId,
          date: data.date,
          startTime: data.startTime,
          status: AppointmentStatus.BOOKED,
        },
      });

      if (slotTaken) {
        const suggestion = await this.suggestNextStreamSlot(appointment.doctorId, data.date, data.startTime, config);
        return {
          message: 'Requested slot unavailable',
          suggestion,
        };
      }
    } else {
      const bookedCount = await this.appointmentRepo.count({
        where: {
          doctorId: appointment.doctorId,
          date: data.date,
          status: AppointmentStatus.BOOKED,
          schedulingType: SchedulingType.WAVE,
        },
      });

      if (bookedCount >= config.maxPatients) {
        const suggestion = await this.suggestNextWaveSlot(appointment.doctorId, data.date, config);
        return {
          message: 'Requested wave is full',
          suggestion,
        };
      }
    }

    appointment.status = AppointmentStatus.RESCHEDULED;
    await this.appointmentRepo.save(appointment);

    const newAppointment = this.appointmentRepo.create({
      patientId,
      doctorId: appointment.doctorId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: AppointmentStatus.BOOKED,
      schedulingType: config.schedulingType as unknown as SchedulingType,
    });

    return this.appointmentRepo.save(newAppointment);
  }

  private async suggestNextStreamSlot(doctorId: number, date: string, startTime: string, config: SchedulingConfig) {
    const availability = await this.getAvailabilityForDate(doctorId, date);
    if (!availability) return null;

    const endTime = this.timeToMinutes(availability.endTime.substring(0, 5));
    let current = this.timeToMinutes(startTime.substring(0, 5)) + config.slotDuration + (config.bufferTime || 0);

    while (current + config.slotDuration <= endTime) {
      const slotStart = this.minutesToTime(current);
      const slotEnd = this.minutesToTime(current + config.slotDuration);

      const taken = await this.appointmentRepo.findOne({
        where: {
          doctorId,
          date,
          startTime: slotStart,
          status: AppointmentStatus.BOOKED,
        },
      });

      if (!taken) {
        return { date, startTime: slotStart, endTime: slotEnd, type: 'STREAM' };
      }

      current += config.slotDuration + (config.bufferTime || 0);
    }

    return { message: 'No more slots available for this date' };
  }

  private async suggestNextWaveSlot(doctorId: number, date: string, config: SchedulingConfig) {
    const nextDate = new Date(date);
    for (let i = 1; i <= 7; i++) {
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      const availability = await this.getAvailabilityForDate(doctorId, nextDateStr);
      if (!availability) continue;

      const bookedCount = await this.appointmentRepo.count({
        where: {
          doctorId,
          date: nextDateStr,
          status: AppointmentStatus.BOOKED,
          schedulingType: SchedulingType.WAVE,
        },
      });

      if (bookedCount < config.maxPatients) {
        return {
          date: nextDateStr,
          startTime: availability.startTime.substring(0, 5),
          endTime: availability.endTime.substring(0, 5),
          availableCapacity: config.maxPatients - bookedCount,
          type: 'WAVE',
        };
      }
    }

    return { message: 'No available wave slots in next 7 days' };
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
>>>>>>> 23d114f (feat: add appointment rescheduling with 30min cutoff and next slot suggestion)
  }
}