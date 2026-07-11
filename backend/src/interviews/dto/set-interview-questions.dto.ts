import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class SetInterviewQuestionsDto {
  @ApiProperty({ type: [String], example: ['Tell me about a time you led a project.'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questions!: string[];
}
