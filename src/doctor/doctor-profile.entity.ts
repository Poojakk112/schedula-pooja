import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('doctor_profiles')
export class DoctorProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  specialization: string;

  @Column()
  experience: string;

  @Column()
  qualification: string;

  @Column({ type: 'decimal' })
  consultationFee: number;

  @Column()
  availabilityHours: string;

  @OneToOne(() => User, (user) => user.doctorProfile)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;
}