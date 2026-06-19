import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorProfile } from './doctor-profile.entity';
import { Appointment, AppointmentStatus } from '../appointment/appointment.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorProfileRepo: Repository<DoctorProfile>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  async createProfile(userId: number, data: Partial<DoctorProfile>) {
    const profile = this.doctorProfileRepo.create({ ...data, userId });
    return this.doctorProfileRepo.save(profile);
  }

  async getProfile(userId: number) {
    const profile = await this.doctorProfileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Doctor profile not found');
    return profile;
  }

  async updateProfile(userId: number, data: Partial<DoctorProfile>) {
    const profile = await this.getProfile(userId);
    Object.assign(profile, data);
    return this.doctorProfileRepo.save(profile);
  }

  async getDoctorAppointments(doctorId: number, date?: string) {
    const where: any = { doctorId };

    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      where.date = date;
    }

    const appointments = await this.appointmentRepo.find({
      where,
      relations: { patient: true },
      order: { date: 'ASC' },
    });

    if (appointments.length === 0) {
      return { message: 'No appointments found', data: [] };
    }

    return appointments.map((apt) => ({
      id: apt.id,
      date: apt.date,
      startTime: apt.startTime,
      endTime: apt.endTime,
      status: apt.status,
      schedulingType: apt.schedulingType,
      tokenNumber: apt.tokenNumber,
      patient: {
        id: apt.patient?.id,
        name: apt.patient?.name,
        email: apt.patient?.email,
      },
    }));
  }

  async cancelAppointment(doctorId: number, id: number) {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.doctorId !== doctorId) throw new ForbiddenException('Unauthorized');
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment already cancelled');
    }
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appointment);
  }
}