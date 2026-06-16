import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchedulingConfig1781602388373 implements MigrationInterface {
    name = 'AddSchedulingConfig1781602388373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."scheduling_config_schedulingtype_enum" AS ENUM('STREAM', 'WAVE')`);
        await queryRunner.query(`CREATE TABLE "scheduling_config" ("id" SERIAL NOT NULL, "doctorId" integer NOT NULL, "schedulingType" "public"."scheduling_config_schedulingtype_enum" NOT NULL, "slotDuration" integer, "bufferTime" integer, "maxPatients" integer, CONSTRAINT "PK_f7fb0d2a768c43c576e33498348" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "scheduling_config" ADD CONSTRAINT "FK_984206a66d7f90caea78d8b7613" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scheduling_config" DROP CONSTRAINT "FK_984206a66d7f90caea78d8b7613"`);
        await queryRunner.query(`DROP TABLE "scheduling_config"`);
        await queryRunner.query(`DROP TYPE "public"."scheduling_config_schedulingtype_enum"`);
    }
}