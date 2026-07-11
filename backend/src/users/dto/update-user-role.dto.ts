import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.HIRING_MANAGER })
  @IsEnum(UserRole)
  role!: UserRole;
}
