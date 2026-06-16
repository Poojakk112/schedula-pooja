import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum SchedulingType {
  STREAM = 'STREAM',
  WAVE = 'WAVE',
}

@Entity('scheduling_config')
export class SchedulingConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column({ type: 'enum', enum: SchedulingType })
  schedulingType: SchedulingType;

  // Stream specific
  @Column({ nullable: true })
  slotDuration: number; // in minutes

  @Column({ nullable: true })
  bufferTime: number; // in minutes

  // Wave specific
  @Column({ nullable: true })
  maxPatients: number;
}
export interface StreamSlot {
  date: string;
  startTime: string;
  endTime: string;
  type: string;
}