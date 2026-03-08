import { MigrationInterface, QueryRunner } from 'typeorm';

export class CapacityCheckAndUserParticipantCascade1772397819021
  implements MigrationInterface
{
  name = 'CapacityCheckAndUserParticipantCascade1772397819021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // BUG-4: Prevent capacity = 0 (logically nonsensical — event is immediately "Full")
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "CHK_events_capacity_positive" CHECK ("capacity" > 0)`,
    );

    // BUG-6: Fix user_id FK in event_participants to CASCADE on user delete
    await queryRunner.query(
      `ALTER TABLE "event_participants" DROP CONSTRAINT "FK_ce3f433e47fdd8f072964293c8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_participants" ADD CONSTRAINT "FK_ce3f433e47fdd8f072964293c8d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert BUG-6 fix
    await queryRunner.query(
      `ALTER TABLE "event_participants" DROP CONSTRAINT "FK_ce3f433e47fdd8f072964293c8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_participants" ADD CONSTRAINT "FK_ce3f433e47fdd8f072964293c8d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Revert BUG-4 fix
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "CHK_events_capacity_positive"`,
    );
  }
}
