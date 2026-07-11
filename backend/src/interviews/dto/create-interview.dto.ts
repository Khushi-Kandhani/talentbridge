import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInterviewDto {
  @ApiProperty({ example: 'app_123' })
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @ApiProperty({ example: 'user_recruiter' })
  @IsString()
  @IsNotEmpty()
  recruiterId!: string;

  @ApiProperty({ example: 'user_manager' })
  @IsString()
  @IsNotEmpty()
  managerId!: string;

  @ApiProperty({ type: [String], example: ['2026-07-10T10:00:00Z', '2026-07-11T14:00:00Z'] })
  @IsOptional()
  @IsArray()
  proposedSlots?: string[];
}
