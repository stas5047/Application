import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { TagResponseDto } from './dto/tag-response.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOkResponse({ type: [TagResponseDto] })
  async findAll(): Promise<TagResponseDto[]> {
    const tags = await this.tagsService.findAll();
    return tags.map((t) => ({ id: t.id, name: t.name }));
  }
}
