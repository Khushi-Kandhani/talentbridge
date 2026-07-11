import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum InterviewType {
  TECHNICAL = 'technical',
  BEHAVIOURAL = 'behavioural',
  FINAL = 'final',
}

export class GenerateInterviewQuestionsDto {
  @ApiProperty({ example: 'We are hiring a Senior Frontend Engineer...' })
  @IsString()
  @IsNotEmpty()
  jobDescription!: string;

  @ApiProperty({ example: '8 years experience, strong in React and design systems' })
  @IsString()
  @IsNotEmpty()
  candidateCvSummary!: string;

  @ApiProperty({ enum: InterviewType, example: InterviewType.TECHNICAL })
  @IsEnum(InterviewType)
  interviewType!: InterviewType;
}
