import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({ example: 'app_123' })
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @ApiProperty({ example: 'Senior Product Designer' })
  @IsString()
  @IsNotEmpty()
  roleTitle!: string;

  @ApiProperty({ example: '$150k', required: false })
  @IsOptional()
  @IsString()
  salary?: string;

  @ApiProperty({ example: '2026-09-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '3 months', required: false })
  @IsOptional()
  @IsString()
  probationPeriod?: string;

  @ApiProperty({ example: 'Health, bonus, remote stipend', required: false })
  @IsOptional()
  @IsString()
  benefits?: string;
}
