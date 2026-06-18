import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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

  // Day 4 - Doctor Discovery APIs
  async getAllDoctors(query: {
    specialization?: string;
    search?: string;
    availability?: string;
    page?: number;
    limit?: number;
  }) {
    let { specialization, search, availability, page, limit } = query;

    // Validate pagination
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1) throw new BadRequestException('Limit must be greater than 0');

    const where: any = {};

    if (specialization) {
      where.specialization = ILike(`%${specialization}%`);
    }

    if (search) {
      where.fullName = ILike(`%${search}%`);
    }

    if (availability === 'true') {
      where.availability = true;
    }

    const [doctors, total] = await this.doctorRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
  id: true,
  fullName: true,
  specialization: true,
  experience: true,
  consultationFee: true,
  availability: true,
},
    });

    if (doctors.length === 0) {
      return { message: 'No doctors found', data: [], total: 0, page, limit };
    }

    return { data: doctors, total, page, limit };
  }

  async getDoctorById(id: number) {
    if (!id || isNaN(id)) throw new BadRequestException('Invalid doctor ID');
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException(`Doctor with ID ${id} not found`);
    return doctor;
  }
}