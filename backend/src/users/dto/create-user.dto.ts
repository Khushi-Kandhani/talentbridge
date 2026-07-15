import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';
export class CreateUserDto {
  @ApiProperty({ example: 'recruiter@talentbridge.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @ApiProperty({ example: 'hashed-password' })
  @IsString()
  @MinLength(8)
  passwordHash!: string;
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;
  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;
  @ApiProperty({ enum: UserRole, example: UserRole.RECRUITER })
  @IsEnum(UserRole)
  role!: UserRole;
}
