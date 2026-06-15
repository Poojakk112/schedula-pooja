import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorProfile } from './doctor-profile.entity';
import { Appointment } from '../appointment/appointment.entity';

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