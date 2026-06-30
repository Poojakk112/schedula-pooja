import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReportingTimeToAppointments1782640374703 implements MigrationInterface {
    name = 'AddReportingTimeToAppointments1782640374703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reminders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointment_id" integer NOT NULL, "message" text NOT NULL, "scheduling_type" character varying NOT NULL, "doctor_name" character varying NOT NULL, "appointment_date" date, "appointment_time" character varying, "reporting_time" character varying, "token_number" integer, "is_sent" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_38715fec7f634b72c6cf7ea4893" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "reportingTime" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "reportingTime"`);
        await queryRunner.query(`DROP TABLE "reminders"`);
    }
}