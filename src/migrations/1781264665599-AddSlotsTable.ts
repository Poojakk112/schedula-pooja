import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlotsTable1781264665599 implements MigrationInterface {
    name = 'AddSlotsTable1781264665599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."slots_status_enum" AS ENUM('AVAILABLE', 'BOOKED')`);
        await queryRunner.query(`CREATE TABLE "slots" ("id" SERIAL NOT NULL, "date" date NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "status" "public"."slots_status_enum" NOT NULL DEFAULT 'AVAILABLE', "doctorId" integer NOT NULL, CONSTRAINT "PK_8b553bb1941663b63fd38405e42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS "phone"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS "address"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN IF EXISTS "phone"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD IF NOT EXISTS "fullName" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD IF NOT EXISTS "age" integer`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD IF NOT EXISTS "gender" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD IF NOT EXISTS "contactDetails" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD IF NOT EXISTS "healthInformation" character varying`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD IF NOT EXISTS "fullName" character varying`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD IF NOT EXISTS "qualification" character varying`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD IF NOT EXISTS "consultationFee" numeric`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD IF NOT EXISTS "availabilityHours" character varying`);
        await queryRunner.query(`ALTER TABLE "slots" ADD CONSTRAINT "FK_58f86e95ea77a4c7c4aec98e6a2" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "slots" DROP CONSTRAINT "FK_58f86e95ea77a4c7c4aec98e6a2"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN IF EXISTS "availabilityHours"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN IF EXISTS "consultationFee"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN IF EXISTS "qualification"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN IF EXISTS "fullName"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS "healthInformation"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS "contactDetails"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS "gender"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS "age"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS "fullName"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "slots"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."slots_status_enum"`);
    }
}