import { ApiProperty } from '@nestjs/swagger';
import { EventSummaryResponseDto } from '../../events/dto/event-response.dto';

export class RecommendationResponseDto extends EventSummaryResponseDto {
  @ApiProperty({ minimum: 0, maximum: 1 })
  matchScore!: number;
}
