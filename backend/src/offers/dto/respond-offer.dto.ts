import { ApiProperty } from '@nestjs/swagger';
import { OfferCandidateResponse } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class RespondOfferDto {
  @ApiProperty({ enum: OfferCandidateResponse, example: OfferCandidateResponse.NEGOTIATED })
  @IsEnum(OfferCandidateResponse)
  response!: OfferCandidateResponse;

  @ApiProperty({ example: 'Could we discuss a higher base salary?', required: false })
  @IsOptional()
  @IsString()
  counterText?: string;
}
