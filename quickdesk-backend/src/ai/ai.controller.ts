import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Get('category-priority')
  async generateCategoryAndPriority(
    @Query('title') title: string,
    @Query('description') description: string,
  ) {
    return this.aiService.generateCategoryAndPriority(title || '', description || '');
  }
}
