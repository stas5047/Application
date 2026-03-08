import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUsers1772397819020 implements MigrationInterface {
  name = 'AddUsernameToUsers1772397819020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "username" character varying`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "username" = 'user_' || SUBSTRING("id"::text, 1, 8) WHERE "username" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_username" UNIQUE ("username")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_username"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
  }
}
