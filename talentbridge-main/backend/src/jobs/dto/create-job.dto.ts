import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty({ example: '$120k - $160k', required: false })
  @IsOptional()
  @IsString()
  salaryBand?: string;

  @ApiProperty({ type: [String], example: ['React', 'TypeScript', 'Tailwind'] })
  @IsArray()
  requiredSkills!: string[];

  @ApiProperty({ example: 'Build user-facing features', required: false })
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiProperty({ example: 'High ownership and collaboration', required: false })
  @IsOptional()
  @IsString()
  cultureNotes?: string;
}
