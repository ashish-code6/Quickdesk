import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('category-priority')
  async generateCategoryAndPriority(
    @Query('description') description: string,
  ) {
    return this.aiService.generateCategoryAndPriority(description);
  }
}
