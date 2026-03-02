import { ApiProperty } from '@nestjs/swagger';

export class MyEventResponseDto {
  @ApiProperty({ description: 'Event UUID' })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'ISO 8601 UTC timestamp',
  })
  dateTime!: Date;

  @ApiProperty()
  location!: string;

  @ApiProperty({ enum: ['organizer', 'participant'] })
  role!: 'organizer' | 'participant';
}
