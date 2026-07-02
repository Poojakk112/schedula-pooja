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

export interface StreamSlot {
  date: string;
  startTime: string;
  endTime: string;
  type: string;
}

@Entity('scheduling_config')
export class SchedulingConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  doctorId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor!: User;

  @Column({ type: 'enum', enum: SchedulingType })
  schedulingType!: SchedulingType;

  @Column({ nullable: true })
  slotDuration!: number;

  @Column({ nullable: true })
  bufferTime!: number;

  @Column({ nullable: true })
  maxPatients!: number;

  @Column({ default: false })
  allowFutureBooking!: boolean;

  @Column({ nullable: true, type: 'int' })
  maxFutureBookingDays!: number | null;
}