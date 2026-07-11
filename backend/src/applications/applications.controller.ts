import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { BulkUpdateStageDto } from './dto/bulk-update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Candidate applies to a job' })
  @ApiResponse({ status: 201, description: 'Application created' })
  create(@Body() dto: CreateApplicationDto, @CurrentUser() user: { userId: string }) {
    return this.applicationsService.create(dto, user.userId);
  }

  @Get()
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN, UserRole.CANDIDATE)
  @ApiOperation({ summary: 'List applications (candidates only see their own; shortlist sortable by AI score)' })
  @ApiResponse({ status: 200, description: 'Applications listed' })
  list(
    @CurrentUser() user: { userId: string; role: UserRole },
    @Query('jobId') jobId?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.applicationsService.list(user, jobId, sortBy === 'aiScore');
  }

  @Get(':id')
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN, UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Get an application' })
  @ApiResponse({ status: 200, description: 'Application found' })
  get(@Param('id') id: string, @CurrentUser() user: { userId: string; role: UserRole }) {
    return this.applicationsService.get(id, user);
  }

  @Post(':id/cv')
  @Roles(UserRole.CANDIDATE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload a CV (PDF, max 5MB); server extracts text and triggers AI scoring' })
  @ApiResponse({ status: 201, description: 'CV uploaded, parsed, and scored' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadCv(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string },
  ) {
    return this.applicationsService.uploadCv(id, user.userId, file);
  }

  @Patch(':id/stage')
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER)
  @ApiOperation({ summary: 'Move an application to the next pipeline stage (role-guarded transition)' })
  @ApiResponse({ status: 200, description: 'Stage updated' })
  updateStage(
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
    @CurrentUser() user: { userId: string; role: UserRole },
  ) {
    return this.applicationsService.updateStage(id, dto.stage, user);
  }

  @Patch('bulk-stage')
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER)
  @ApiOperation({ summary: 'Advance or reject multiple candidates in one action' })
  @ApiResponse({ status: 200, description: 'Stages updated in bulk' })
  bulkUpdateStage(@Body() dto: BulkUpdateStageDto, @CurrentUser() user: { userId: string; role: UserRole }) {
    return this.applicationsService.bulkUpdateStage(dto, user);
  }
}
