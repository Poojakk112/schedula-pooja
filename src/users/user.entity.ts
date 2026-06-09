import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { DoctorProfile } from '../doctor/doctor-profile.entity';
import { PatientProfile } from '../patient/patient-profile.entity';

export enum Role {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @OneToOne(() => DoctorProfile, (doctor) => doctor.user, { nullable: true })
  doctorProfile: DoctorProfile;

  @OneToOne(() => PatientProfile, (patient) => patient.user, { nullable: true })
  patientProfile: PatientProfile;
}