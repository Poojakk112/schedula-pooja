import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id' })
  appointmentId: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'scheduling_type', type: 'varchar' })
  schedulingType: string;

  @Column({ name: 'doctor_name', type: 'varchar' })
  doctorName: string;

  @Column({ name: 'appointment_date', type: 'date', nullable: true })
  appointmentDate: Date | null;

  @Column({ name: 'appointment_time', type: 'varchar', nullable: true })
  appointmentTime: string | null;

  @Column({ name: 'reporting_time', type: 'varchar', nullable: true })
  reportingTime: string | null;

  @Column({ name: 'token_number', type: 'int', nullable: true })
  tokenNumber: number | null;

  @Column({ name: 'is_sent', type: 'boolean', default: false })
  isSent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}