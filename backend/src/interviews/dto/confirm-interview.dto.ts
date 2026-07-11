import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmInterviewDto {
  @ApiProperty({ example: '2026-07-10T10:00:00Z', description: 'One of the proposed slots, or a new alternative slot being requested' })
  @IsString()
  @IsNotEmpty()
  slot!: string;
}
