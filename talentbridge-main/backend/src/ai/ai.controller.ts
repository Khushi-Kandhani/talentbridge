import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateJobDescriptionDto } from './dto/generate-job-description.dto';
import { ScreenCvDto } from './dto/screen-cv.dto';
import { GenerateInterviewQuestionsDto } from './dto/generate-interview-questions.dto';
import { DraftOfferLetterDto } from './dto/draft-offer-letter.dto';
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
  @ApiOperation({ summary: 'AI Feature 1: generate a job description (with fallback template)' })
  @ApiResponse({ status: 201, description: 'Job description generated' })
  generateJobDescription(@Body() dto: GenerateJobDescriptionDto) {
    return this.aiService.generateJobDescription(dto);
  }

  @Post('screen-cv')
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER)
  @ApiOperation({ summary: 'AI Feature 2: score a CV against job requirements (with manual-review fallback)' })
  @ApiResponse({ status: 201, description: 'CV screened' })
  screenCv(@Body() dto: ScreenCvDto) {
    return this.aiService.screenCv(dto);
  }

  @Post('generate-interview-questions')
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER)
  @ApiOperation({ summary: 'AI Feature 3: generate tailored interview questions (with generic bank fallback)' })
  @ApiResponse({ status: 201, description: 'Interview questions generated' })
  generateInterviewQuestions(@Body() dto: GenerateInterviewQuestionsDto) {
    return this.aiService.generateInterviewQuestions(dto);
  }

  @Post('draft-offer-letter')
  @Roles(UserRole.HIRING_MANAGER)
  @ApiOperation({ summary: 'AI Feature 4 (Bonus): draft an offer letter (with manual-drafting fallback)' })
  @ApiResponse({ status: 201, description: 'Offer letter drafted' })
  draftOfferLetter(@Body() dto: DraftOfferLetterDto) {
    return this.aiService.draftOfferLetter(dto);
  }
}
