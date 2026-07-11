import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @Roles(UserRole.HIRING_MANAGER)
  @ApiOperation({ summary: 'Hiring manager issues an offer' })
  @ApiResponse({ status: 201, description: 'Offer created' })
  create(@Body() dto: CreateOfferDto, @CurrentUser() user: { userId: string }) {
    return this.offersService.create(dto, user.userId);
  }

  @Get()
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN, UserRole.CANDIDATE)
  @ApiOperation({ summary: 'List offers (candidates only see their own)' })
  @ApiResponse({ status: 200, description: 'Offers listed' })
  list(@CurrentUser() user: { userId: string; role: UserRole }) {
    return this.offersService.list(user);
  }

  @Get(':id')
  @Roles(UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.ADMIN, UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Get an offer' })
  @ApiResponse({ status: 200, description: 'Offer found' })
  get(@Param('id') id: string, @CurrentUser() user: { userId: string; role: UserRole }) {
    return this.offersService.get(id, user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.RECRUITER)
  @ApiOperation({ summary: 'Recruiter explicitly approves an offer (letter) before it is sent to the candidate' })
  @ApiResponse({ status: 200, description: 'Offer approved' })
  approve(@Param('id') id: string) {
    return this.offersService.approve(id);
  }

  @Patch(':id/respond')
  @Roles(UserRole.CANDIDATE)
  @ApiOperation({ summary: 'Candidate accepts, rejects, or negotiates (free-text counter) an approved offer' })
  @ApiResponse({ status: 200, description: 'Response recorded, recruiter notified in real time' })
  respond(@Param('id') id: string, @Body() dto: RespondOfferDto, @CurrentUser() user: { userId: string }) {
    return this.offersService.respond(id, dto, user.userId);
  }
}
