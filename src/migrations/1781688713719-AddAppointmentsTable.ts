import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppointmentsTable1781688713719 implements MigrationInterface {
    name = 'AddAppointmentsTable1781688713719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointments_schedulingtype_enum" AS ENUM('STREAM', 'WAVE')`);
        await queryRunner.query(`ALTER TYPE "public"."appointments_status_enum" ADD VALUE IF NOT EXISTS 'RESCHEDULED'`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "schedulingType" "public"."appointments_schedulingtype_enum"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "tokenNumber" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN IF EXISTS "tokenNumber"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN IF EXISTS "schedulingType"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."appointments_schedulingtype_enum"`);
    }
}