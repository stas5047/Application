import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  EventDetailResponseDto,
  EventSummaryResponseDto,
} from './dto/event-response.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all public events' })
  @ApiOkResponse({ type: [EventSummaryResponseDto] })
  findAll(
    @Req() req: Request & { user: AuthenticatedUser | null },
  ): Promise<EventSummaryResponseDto[]> {
    return this.eventsService.findAllPublic(req.user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiOkResponse({ type: EventDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Event not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: AuthenticatedUser | null },
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.findOne(id, req.user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiCreatedResponse({ type: EventDetailResponseDto })
  @ApiBadRequestResponse({
    description: 'Validation failed or date in the past',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  create(
    @Body() dto: CreateEventDto,
    @Req() req: Request & { user: AuthenticatedUser },
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event (organizer only)' })
  @ApiOkResponse({ type: EventDetailResponseDto })
  @ApiForbiddenResponse({
    description: 'Only the organizer can modify this event',
  })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @Req() req: Request & { user: AuthenticatedUser },
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event (organizer only)' })
  @ApiNoContentResponse({ description: 'Event deleted' })
  @ApiForbiddenResponse({
    description: 'Only the organizer can delete this event',
  })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: AuthenticatedUser },
  ): Promise<void> {
    return this.eventsService.remove(id, req.user.id);
  }

  @Post(':id/join')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join an event' })
  @ApiOkResponse({ type: EventDetailResponseDto })
  @ApiConflictResponse({
    description:
      'User has already joined this event or event is at full capacity',
  })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  join(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: AuthenticatedUser },
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.join(id, req.user.id);
  }

  @Post(':id/leave')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave an event' })
  @ApiOkResponse({ type: EventDetailResponseDto })
  @ApiConflictResponse({
    description: 'User is not a participant of this event',
  })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  leave(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: AuthenticatedUser },
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.leave(id, req.user.id);
  }
}
