import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an application' })
  @ApiResponse({ status: 201, description: 'Application created' })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List applications' })
  @ApiResponse({ status: 200, description: 'Applications listed' })
  list() {
    return this.applicationsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an application' })
  @ApiResponse({ status: 200, description: 'Application found' })
  get(@Param('id') id: string) {
    return this.applicationsService.get(id);
  }
}
