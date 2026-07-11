import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { ConfirmInterviewDto } from './dto/confirm-interview.dto';
import { SetInterviewQuestionsDto } from './dto/set-interview-questions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @Roles(UserRole.RECRUITER)
  @ApiOperation({ summary: 'Recruiter proposes interview slots' })
  @ApiResponse({ status: 201, description: 'Interview created' })
  create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(dto);
  }

  @Get()
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN, UserRole.CANDIDATE)
  @ApiOperation({ summary: 'List interviews (candidates only see their own)' })
  @ApiResponse({ status: 200, description: 'Interviews listed' })
  list(@CurrentUser() user: { userId: string; role: UserRole }) {
    return this.interviewsService.list(user);
  }

  @Get(':id')
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN, UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Get an interview' })
  @ApiResponse({ status: 200, description: 'Interview found' })
  get(@Param('id') id: string, @CurrentUser() user: { userId: string; role: UserRole }) {
    return this.interviewsService.get(id, user);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.CANDIDATE, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Candidate confirms a proposed slot or requests an alternative; conflict-checked against the manager\'s confirmed interviews' })
  @ApiResponse({ status: 200, description: 'Interview confirmed' })
  confirm(
    @Param('id') id: string,
    @Body() dto: ConfirmInterviewDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.interviewsService.confirmSlot(id, dto.slot, user);
  }

  @Patch(':id/questions')
  @Roles(UserRole.HIRING_MANAGER)
  @ApiOperation({ summary: 'Save the final (edited/reordered) AI-generated interview question list' })
  @ApiResponse({ status: 200, description: 'Questions saved' })
  setQuestions(@Param('id') id: string, @Body() dto: SetInterviewQuestionsDto) {
    return this.interviewsService.setQuestions(id, dto.questions);
  }
}
