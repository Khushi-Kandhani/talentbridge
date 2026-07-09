import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InterviewStatus } from '@prisma/client';

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

  @ApiProperty({ type: [String], example: ['2026-07-10T10:00:00Z'] })
  @IsOptional()
  @IsArray()
  proposedSlots?: string[];

  @ApiProperty({ example: '2026-07-10T10:00:00Z' })
  @IsOptional()
  @IsString()
  confirmedSlot?: string;

  @ApiProperty({ enum: InterviewStatus, example: InterviewStatus.PENDING })
  @IsEnum(InterviewStatus)
  status!: InterviewStatus;

  @ApiProperty({ type: [String], example: ['Tell me about yourself'] })
  @IsOptional()
  @IsArray()
  aiQuestions?: string[];
}
