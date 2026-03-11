import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventVisibility } from '../entities/event.entity';
import { TagResponseDto } from '../../tags/dto/tag-response.dto';

export class EventOrganizerDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  username!: string;
}

export class EventParticipantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  username!: string;
}

export class EventSummaryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty()
  dateTime!: Date;

  @ApiProperty()
  location!: string;

  @ApiPropertyOptional({ nullable: true })
  capacity!: number | null;

  @ApiProperty({ enum: EventVisibility })
  visibility!: EventVisibility;

  @ApiProperty()
  organizerId!: string;

  @ApiProperty({ type: () => EventOrganizerDto })
  organizer!: EventOrganizerDto;

  @ApiProperty()
  participantCount!: number;

  @ApiProperty()
  isJoined!: boolean;

  @ApiProperty({ type: () => [TagResponseDto] })
  tags!: TagResponseDto[];

  @ApiProperty()
  createdAt!: Date;
}

export class EventDetailResponseDto extends EventSummaryResponseDto {
  @ApiProperty({ type: () => [EventParticipantDto] })
  participants!: EventParticipantDto[];
}
