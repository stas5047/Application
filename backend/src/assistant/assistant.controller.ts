import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AssistantService } from './assistant.service';
import { AskDto } from './dto/ask.dto';
import { AssistantResponseDto } from './dto/assistant-response.dto';

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 4 } })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AssistantResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded (4 requests/minute)',
  })
  async ask(
    @Request() req: RequestWithUser,
    @Body() dto: AskDto,
  ): Promise<AssistantResponseDto> {
    const answer = await this.assistantService.ask(req.user.id, dto.question);
    return { answer };
  }
}
