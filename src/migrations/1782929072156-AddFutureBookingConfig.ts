import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFutureBookingConfig1782929072156 implements MigrationInterface {
    name = 'AddFutureBookingConfig1782929072156'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduling_config" ADD "allowFutureBooking" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "scheduling_config" ADD "maxFutureBookingDays" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduling_config" DROP COLUMN "maxFutureBookingDays"`);
        await queryRunner.query(`ALTER TABLE "scheduling_config" DROP COLUMN "allowFutureBooking"`);
    }
}