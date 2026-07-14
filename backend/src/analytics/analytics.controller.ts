import { Controller, Get, UseGuards } from '@nestjs/common';
<<<<<<< HEAD
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
=======
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
>>>>>>> 074ea285712a8fea6a19a9dde12639385655a56a

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
<<<<<<< HEAD
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get hiring analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics overview returned' })
=======
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin analytics overview: time-to-hire, funnel drop-off, offer acceptance, hiring-stage counts' })
  @ApiResponse({ status: 200, description: 'Analytics overview computed from real application/offer data' })
>>>>>>> 074ea285712a8fea6a19a9dde12639385655a56a
  getOverview() {
    return this.analyticsService.getOverview();
  }
}
