import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailabilityToDoctor1780992166721 implements MigrationInterface {
    name = 'AddAvailabilityToDoctor1780992166721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD "availability" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP COLUMN "availability"`);
    }

}
