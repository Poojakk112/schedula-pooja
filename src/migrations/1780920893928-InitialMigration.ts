import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1780920893928 implements MigrationInterface {
    name = 'InitialMigration1780920893928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patient_profiles" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "age" integer NOT NULL, "gender" character varying NOT NULL, "contactDetails" character varying NOT NULL, "healthInformation" character varying, "userId" integer NOT NULL, CONSTRAINT "REL_fc4788002ae2de0a68f6ccf24e" UNIQUE ("userId"), CONSTRAINT "PK_7297a6976f065cc75e798674aa8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('DOCTOR', 'PATIENT')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_profiles" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "specialization" character varying NOT NULL, "experience" character varying NOT NULL, "qualification" character varying NOT NULL, "consultationFee" numeric NOT NULL, "availabilityHours" character varying NOT NULL, "userId" integer NOT NULL, CONSTRAINT "REL_a798afca9436b00dac80f911a8" UNIQUE ("userId"), CONSTRAINT "PK_b07c128005f6a0d0135d6e7353b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD CONSTRAINT "FK_fc4788002ae2de0a68f6ccf24e5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_profiles" ADD CONSTRAINT "FK_a798afca9436b00dac80f911a83" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_profiles" DROP CONSTRAINT "FK_a798afca9436b00dac80f911a83"`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP CONSTRAINT "FK_fc4788002ae2de0a68f6ccf24e5"`);
        await queryRunner.query(`DROP TABLE "doctor_profiles"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "patient_profiles"`);
    }

}
