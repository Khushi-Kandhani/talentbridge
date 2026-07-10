import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles(UserRole.RECRUITER)
  @ApiOperation({ summary: 'Create a job posting' })
  @ApiResponse({ status: 201, description: 'Job created' })
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List job postings' })
  @ApiResponse({ status: 200, description: 'Jobs listed' })
  list() {
    return this.jobsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job posting' })
  @ApiResponse({ status: 200, description: 'Job found' })
  get(@Param('id') id: string) {
    return this.jobsService.get(id);
  }
}
