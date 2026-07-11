import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DraftOfferLetterDto {
  @ApiProperty({ example: 'Ava Chen' })
  @IsString()
  @IsNotEmpty()
  candidateName!: string;

  @ApiProperty({ example: 'Senior Product Designer' })
  @IsString()
  @IsNotEmpty()
  roleTitle!: string;

  @ApiProperty({ example: '$150,000/year' })
  @IsString()
  @IsNotEmpty()
  salary!: string;

  @ApiProperty({ example: '2026-09-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '3 months', required: false })
  @IsOptional()
  @IsString()
  probationPeriod?: string;

  @ApiProperty({ example: 'Health insurance, 25 days PTO, remote stipend' })
  @IsString()
  @IsNotEmpty()
  benefits!: string;

  @ApiProperty({ example: 'NexGen SME Alliance' })
  @IsString()
  @IsNotEmpty()
  companyName!: string;
}
