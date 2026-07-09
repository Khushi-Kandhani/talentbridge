import { ApiProperty } from '@nestjs/swagger';
import { PipelineStage } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'job_123' })
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @ApiProperty({ example: 'user_456' })
  @IsString()
  @IsNotEmpty()
  candidateId!: string;

  @ApiProperty({ example: 'Interested in the role' })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiProperty({ example: 6 })
  @IsOptional()
  @IsInt()
  yearsOfExperience?: number;

  @ApiProperty({ example: '$140k' })
  @IsOptional()
  @IsString()
  salaryExpectation?: string;

  @ApiProperty({ example: '2026-07-20' })
  @IsOptional()
  @IsDateString()
  availabilityDate?: string;

  @ApiProperty({ example: 'Extracted text from CV' })
  @IsOptional()
  @IsString()
  cvText?: string;

  @ApiProperty({ example: 87 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  aiScore?: number;

  @ApiProperty({ type: [String], example: ['React', 'TypeScript'] })
  @IsOptional()
  @IsArray()
  aiStrengths?: string[];

  @ApiProperty({ type: [String], example: ['Testing'] })
  @IsOptional()
  @IsArray()
  aiGaps?: string[];

  @ApiProperty({ enum: PipelineStage, example: PipelineStage.APPLIED })
  @IsEnum(PipelineStage)
  stage!: PipelineStage;
}
