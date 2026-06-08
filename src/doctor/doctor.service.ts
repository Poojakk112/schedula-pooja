import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorProfile } from './doctor-profile.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorRepository: Repository<DoctorProfile>,
  ) {}

  async createProfile(userId: number, data: Partial<DoctorProfile>) {
    const existing = await this.doctorRepository.findOne({ where: { userId } });
    if (existing) throw new ConflictException('Doctor profile already exists');
    const profile = this.doctorRepository.create({ ...data, userId });
    return this.doctorRepository.save(profile);
  }

  async getProfile(userId: number) {
    const profile = await this.doctorRepository.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Doctor profile not found');
    return profile;
  }

  async updateProfile(userId: number, data: Partial<DoctorProfile>) {
    const profile = await this.getProfile(userId);
    Object.assign(profile, data);
    return this.doctorRepository.save(profile);
  }
}