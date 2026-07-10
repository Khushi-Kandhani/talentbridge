import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';

@ApiTags('interviews')
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an interview' })
  @ApiResponse({ status: 201, description: 'Interview created' })
  create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List interviews' })
  @ApiResponse({ status: 200, description: 'Interviews listed' })
  list() {
    return this.interviewsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an interview' })
  @ApiResponse({ status: 200, description: 'Interview found' })
  get(@Param('id') id: string) {
    return this.interviewsService.get(id);
  }
}
