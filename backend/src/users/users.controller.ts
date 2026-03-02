import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { UsersService } from './users.service';
import { MyEventResponseDto } from './dto/my-event-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/events')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Get all events for the authenticated user (organizer or participant)',
  })
  @ApiOkResponse({ type: [MyEventResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getMyEvents(
    @Req() req: Request & { user: AuthenticatedUser },
  ): Promise<MyEventResponseDto[]> {
    return this.usersService.getMyEvents(req.user.id);
  }
}
