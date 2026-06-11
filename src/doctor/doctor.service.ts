import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorProfile } from './doctor-profile.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorProfileRepo: Repository<DoctorProfile>,
  ) {}

  async getProfile(userId: number) {
    const profile = await this.doctorProfileRepo.findOne({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Doctor profile not found');
    return profile;
  }
}