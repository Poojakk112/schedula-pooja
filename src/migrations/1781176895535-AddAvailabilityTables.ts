import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailabilityTables1781176895535 implements MigrationInterface {
    name = 'AddAvailabilityTables1781176895535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "custom_availability" ("id" SERIAL NOT NULL, "date" date NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "doctorId" integer NOT NULL, CONSTRAINT "PK_e9b8fa5803ca3d6554a7ddf7045" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."recurring_availability_dayofweek_enum" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')`);
        await queryRunner.query(`CREATE TABLE "recurring_availability" ("id" SERIAL NOT NULL, "dayOfWeek" "public"."recurring_availability_dayofweek_enum" NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "doctorId" integer NOT NULL, CONSTRAINT "PK_2464dd095ba418858c1aa3f4e01" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN "fullName"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN "qualification"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN "consultationFee"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN "availabilityHours"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN "availability"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "fullName"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "contactDetails"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "healthInformation"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD "dateOfBirth" character varying`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ALTER COLUMN "specialization" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ALTER COLUMN "experience" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "custom_availability" ADD CONSTRAINT "FK_1a33c02748c794ea9bf0a13fbf0" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recurring_availability" ADD CONSTRAINT "FK_5c644a995dc9bed981684fb32f8" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recurring_availability" DROP CONSTRAINT "FK_5c644a995dc9bed981684fb32f8"`);
        await queryRunner.query(`ALTER TABLE "custom_availability" DROP CONSTRAINT "FK_1a33c02748c794ea9bf0a13fbf0"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ALTER COLUMN "experience" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ALTER COLUMN "specialization" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD "healthInformation" character varying`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD "contactDetails" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD "gender" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD "age" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD "fullName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD "availability" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD "availabilityHours" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD "consultationFee" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD "qualification" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD "fullName" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "recurring_availability"`);
        await queryRunner.query(`DROP TYPE "public"."recurring_availability_dayofweek_enum"`);
        await queryRunner.query(`DROP TABLE "custom_availability"`);
    }

}
