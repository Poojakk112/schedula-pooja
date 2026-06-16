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
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  qualification: string;

  @Column({ type: 'decimal', nullable: true })
  consultationFee: number;

  @Column({ nullable: true })
  availabilityHours: string;

  @Column({ nullable: true })
  phone: string;
}