import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: dto.passwordHash,
        role: dto.role,
      },
    });
  }

  list() {
    return this.prisma.user.findMany();
  }
}
