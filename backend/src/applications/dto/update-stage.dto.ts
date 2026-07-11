import { ApiProperty } from '@nestjs/swagger';
import { PipelineStage } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateStageDto {
  @ApiProperty({ enum: PipelineStage, example: PipelineStage.SHORTLISTED })
  @IsEnum(PipelineStage)
  stage!: PipelineStage;
}
