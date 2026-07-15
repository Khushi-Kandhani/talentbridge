import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
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
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
      },
    });
  }
  list() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async updateRole(id: string, role: UserRole, requesterId: string) {
    if (id === requesterId) {
      throw new ForbiddenException('Admins cannot change their own role');
    }
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
