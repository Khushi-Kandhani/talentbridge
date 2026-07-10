import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Create an application' })
  @ApiResponse({ status: 201, description: 'Application created' })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List applications' })
  @ApiResponse({ status: 200, description: 'Applications listed' })
  list() {
    return this.applicationsService.list();
  }

  @Get(':id')
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get an application' })
  @ApiResponse({ status: 200, description: 'Application found' })
  get(@Param('id') id: string) {
    return this.applicationsService.get(id);
  }
}
