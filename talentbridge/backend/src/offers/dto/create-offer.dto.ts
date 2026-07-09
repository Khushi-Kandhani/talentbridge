import { ApiProperty } from '@nestjs/swagger';
import { OfferCandidateResponse } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({ example: 'app_123' })
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @ApiProperty({ example: 'user_manager' })
  @IsString()
  @IsNotEmpty()
  managerId!: string;

  @ApiProperty({ example: 'Senior Product Designer' })
  @IsString()
  @IsNotEmpty()
  roleTitle!: string;

  @ApiProperty({ example: '$150k' })
  @IsOptional()
  @IsString()
  salary?: string;

  @ApiProperty({ example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '3 months' })
  @IsOptional()
  @IsString()
  probationPeriod?: string;

  @ApiProperty({ example: 'Health, bonus, remote stipend' })
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiProperty({ enum: OfferCandidateResponse, example: OfferCandidateResponse.NEGOTIATED })
  @IsOptional()
  @IsEnum(OfferCandidateResponse)
  candidateResponse?: OfferCandidateResponse;

  @ApiProperty({ example: 'Counteroffer requested' })
  @IsOptional()
  @IsString()
  counterText?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isApprovedByRecruiter!: boolean;
}
