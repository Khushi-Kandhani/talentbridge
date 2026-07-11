import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles(UserRole.RECRUITER)
  @ApiOperation({ summary: 'Create a job posting (always starts as DRAFT)' })
  @ApiResponse({ status: 201, description: 'Job created' })
  create(@Body() dto: CreateJobDto, @CurrentUser() user: { userId: string }) {
    return this.jobsService.create(dto, user.userId);
  }

  @Get()
  @Roles(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List job postings (candidates only see Published jobs)' })
  @ApiResponse({ status: 200, description: 'Jobs listed' })
  list(@CurrentUser() user: { userId: string; role: UserRole }) {
    return this.jobsService.list(user);
  }

  @Get(':id')
  @Roles(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a job posting' })
  @ApiResponse({ status: 200, description: 'Job found' })
  get(@Param('id') id: string, @CurrentUser() user: { userId: string; role: UserRole }) {
    return this.jobsService.get(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Transition a job posting: Draft -> Published -> Closed -> Archived' })
  @ApiResponse({ status: 200, description: 'Job status updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateJobStatusDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.jobsService.updateStatus(id, dto.status, user);
  }
}
