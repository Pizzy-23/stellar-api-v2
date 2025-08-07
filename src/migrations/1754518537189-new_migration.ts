import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1754518537189 implements MigrationInterface {
    name = 'NewMigration1754518537189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "distanceKm" numeric(10,3) NOT NULL, "durationSeconds" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "clubId" uuid, CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "club" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "usdcPool" numeric(10,2) NOT NULL DEFAULT '0', "distributionType" "public"."club_distributiontype_enum" NOT NULL DEFAULT 'PROPORTIONAL', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "creatorId" uuid, CONSTRAINT "PK_79282481e036a6e0b180afa38aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "stellarAddress" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_clubs_club" ("userId" uuid NOT NULL, "clubId" uuid NOT NULL, CONSTRAINT "PK_8d2e46e0fed2efe2a70dcee474f" PRIMARY KEY ("userId", "clubId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_72ab899d8e323ab8bd88922f52" ON "user_clubs_club" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1be041afa57651b5b1733faa2e" ON "user_clubs_club" ("clubId") `);
        await queryRunner.query(`ALTER TABLE "activity" ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity" ADD CONSTRAINT "FK_83c2d0c0a47279610e7decbd0c0" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "club" ADD CONSTRAINT "FK_feef3747afa8cd290fa633c221d" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_clubs_club" ADD CONSTRAINT "FK_72ab899d8e323ab8bd88922f52c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_clubs_club" ADD CONSTRAINT "FK_1be041afa57651b5b1733faa2eb" FOREIGN KEY ("clubId") REFERENCES "club"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_clubs_club" DROP CONSTRAINT "FK_1be041afa57651b5b1733faa2eb"`);
        await queryRunner.query(`ALTER TABLE "user_clubs_club" DROP CONSTRAINT "FK_72ab899d8e323ab8bd88922f52c"`);
        await queryRunner.query(`ALTER TABLE "club" DROP CONSTRAINT "FK_feef3747afa8cd290fa633c221d"`);
        await queryRunner.query(`ALTER TABLE "activity" DROP CONSTRAINT "FK_83c2d0c0a47279610e7decbd0c0"`);
        await queryRunner.query(`ALTER TABLE "activity" DROP CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1be041afa57651b5b1733faa2e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_72ab899d8e323ab8bd88922f52"`);
        await queryRunner.query(`DROP TABLE "user_clubs_club"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "club"`);
        await queryRunner.query(`DROP TABLE "activity"`);
    }

}
