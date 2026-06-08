import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientProfile } from './patient-profile.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientProfile)
    private patientRepository: Repository<PatientProfile>,
  ) {}

  async createProfile(userId: number, data: Partial<PatientProfile>) {
    const existing = await this.patientRepository.findOne({ where: { userId } });
    if (existing) throw new ConflictException('Patient profile already exists');
    const profile = this.patientRepository.create({ ...data, userId });
    return this.patientRepository.save(profile);
  }

  async getProfile(userId: number) {
    const profile = await this.patientRepository.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Patient profile not found');
    return profile;
  }

  async updateProfile(userId: number, data: Partial<PatientProfile>) {
    const profile = await this.getProfile(userId);
    Object.assign(profile, data);
    return this.patientRepository.save(profile);
  }
}