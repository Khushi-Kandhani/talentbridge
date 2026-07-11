import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * User management (spec §3.1 — Admin: "user management"). Account creation
 * goes through POST /auth/register, which safely hashes passwords; this
 * controller is admin-only and never accepts a raw password/hash.
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Admin: list all users' })
  @ApiResponse({ status: 200, description: 'Users listed' })
  list() {
    return this.usersService.list();
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Admin: change a user\'s role' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Admin: remove a user' })
  @ApiResponse({ status: 200, description: 'User removed' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
