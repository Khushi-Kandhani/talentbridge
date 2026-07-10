import { Injectable } from '@nestjs/common';
import { PrismaService, User } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: dto.passwordHash,
        role: dto.role,
      },
    });
  }

  async list(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
