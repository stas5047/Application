import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { UsersService } from './users.service';
import { MyEventResponseDto } from './dto/my-event-response.dto';

@ApiTags('users')
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
  @ApiResponse({ status: 200, type: [MyEventResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyEvents(
    @Req() req: Request & { user: AuthenticatedUser },
  ): Promise<MyEventResponseDto[]> {
    return this.usersService.getMyEvents(req.user.id);
  }
}
