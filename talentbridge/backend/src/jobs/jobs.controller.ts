import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
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
