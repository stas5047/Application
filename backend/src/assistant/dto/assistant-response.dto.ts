import { ApiProperty } from '@nestjs/swagger';

export class AssistantResponseDto {
  @ApiProperty()
  answer!: string;
}
