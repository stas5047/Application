import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventVisibility } from '../entities/event.entity';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiProperty()
  @IsISO8601()
  @IsNotEmpty()
  dateTime!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  capacity?: number | null;

  @ApiPropertyOptional({ enum: EventVisibility })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility;

  @ApiPropertyOptional({ type: [String], maxItems: 5 })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  @MaxLength(30, { each: true })
  tagNames?: string[];
}
