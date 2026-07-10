import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateJobDescriptionDto } from './dto/generate-job-description.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-job-description')
  @Roles(UserRole.RECRUITER)
  @ApiOperation({ summary: 'Generate a job description using AI (with fallback template)' })
  @ApiResponse({ status: 201, description: 'Job description generated' })
  generateJobDescription(@Body() dto: GenerateJobDescriptionDto) {
    return this.aiService.generateJobDescription(dto);
  }
}
