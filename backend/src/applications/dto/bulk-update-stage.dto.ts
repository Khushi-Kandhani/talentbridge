import { ApiProperty } from '@nestjs/swagger';
import { PipelineStage } from '@prisma/client';
import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';

export class BulkUpdateStageDto {
  @ApiProperty({ type: [String], example: ['app_1', 'app_2'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  applicationIds!: string[];

  @ApiProperty({ enum: PipelineStage, example: PipelineStage.SCREENED })
  @IsEnum(PipelineStage)
  stage!: PipelineStage;
}
