import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum JobLevel {
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
}

export class GenerateJobDescriptionDto {
  @ApiProperty({ example: 'Senior Frontend Engineer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  department!: string;

  @ApiProperty({ type: [String], example: ['React', 'TypeScript', 'Tailwind'] })
  @IsArray()
  requiredSkills!: string[];

  @ApiProperty({ enum: JobLevel, example: JobLevel.MID })
  @IsEnum(JobLevel)
  level!: JobLevel;

  @ApiProperty({ example: 'Fast-paced, collaborative, high ownership', required: false })
  @IsOptional()
  @IsString()
  cultureNotes?: string;
}
