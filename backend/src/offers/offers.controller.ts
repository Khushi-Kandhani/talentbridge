import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an offer' })
  @ApiResponse({ status: 201, description: 'Offer created' })
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List offers' })
  @ApiResponse({ status: 200, description: 'Offers listed' })
  list() {
    return this.offersService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer' })
  @ApiResponse({ status: 200, description: 'Offer found' })
  get(@Param('id') id: string) {
    return this.offersService.get(id);
  }
}
