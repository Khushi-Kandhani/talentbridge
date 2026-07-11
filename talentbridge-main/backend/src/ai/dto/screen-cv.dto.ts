import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ScreenCvDto {
  @ApiProperty({ example: 'John Doe, 6 years experience, React, Node.js...' })
  @IsString()
  @IsNotEmpty()
  cvText!: string;

  @ApiProperty({ example: 'We are hiring a Senior Frontend Engineer...' })
  @IsString()
  @IsNotEmpty()
  jobDescription!: string;

  @ApiProperty({ type: [String], example: ['React', 'TypeScript', 'Tailwind'] })
  @IsArray()
  requiredSkills!: string[];
}
