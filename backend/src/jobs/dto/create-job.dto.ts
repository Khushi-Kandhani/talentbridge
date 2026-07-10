import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JobStatus } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Frontend Engineer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  department!: string;

  @ApiProperty({ example: 'full-time' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: '$120k - $160k' })
  @IsOptional()
  @IsString()
  salaryBand?: string;

  @ApiProperty({ type: [String], example: ['React', 'TypeScript', 'Tailwind'] })
  @IsArray()
  requiredSkills!: string[];

  @ApiProperty({ example: 'Build user-facing features' })
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiProperty({ example: 'High ownership and collaboration' })
  @IsOptional()
  @IsString()
  cultureNotes?: string;

  @ApiProperty({ enum: JobStatus, example: JobStatus.DRAFT })
  @IsEnum(JobStatus)
  status!: JobStatus;

  @ApiProperty({ example: 'cm1abc123' })
  @IsString()
  @IsNotEmpty()
  recruiterId!: string;
}
