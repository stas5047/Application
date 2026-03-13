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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AssistantResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async ask(
    @Request() req: RequestWithUser,
    @Body() dto: AskDto,
  ): Promise<AssistantResponseDto> {
    const answer = await this.assistantService.ask(req.user.id, dto.question);
    return { answer };
  }
}
