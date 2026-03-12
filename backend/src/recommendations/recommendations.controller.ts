import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';

@ApiTags('Recommendations')
@ApiBearerAuth()
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOkResponse({ type: [RecommendationResponseDto] })
  getRecommendations(
    @Request() req: { user: { id: string; username: string } },
  ): Promise<RecommendationResponseDto[]> {
    return this.recommendationsService.getPersonalizedRecommendations(
      req.user.id,
    );
  }
}
