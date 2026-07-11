import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'job_123' })
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @ApiProperty({ example: 'Interested in the role', required: false })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiProperty({ example: 6, required: false })
  @IsOptional()
  @IsInt()
  yearsOfExperience?: number;

  @ApiProperty({ example: '$140k', required: false })
  @IsOptional()
  @IsString()
  salaryExpectation?: string;

  @ApiProperty({ example: '2026-07-20', required: false })
  @IsOptional()
  @IsDateString()
  availabilityDate?: string;

  @ApiProperty({ example: 'Extracted text from CV (usually set later via CV upload)', required: false })
  @IsOptional()
  @IsString()
  cvText?: string;
}
