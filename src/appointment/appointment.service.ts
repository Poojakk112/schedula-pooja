import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
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
    const existing = await this.appointmentRepo.findOne({
      where: {
        doctorId: data.doctorId,
        date: data.date,
        startTime: data.startTime,
        status: AppointmentStatus.BOOKED,
      },
    });
    if (existing) throw new BadRequestException('Slot already booked');

    const appointment = this.appointmentRepo.create({
      ...data,
      patientId,
      status: AppointmentStatus.BOOKED,
    });

    return this.appointmentRepo.save(appointment);
  }

  async getPatientAppointments(patientId: number) {
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
    }

    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appointment);
  }

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
  }
}