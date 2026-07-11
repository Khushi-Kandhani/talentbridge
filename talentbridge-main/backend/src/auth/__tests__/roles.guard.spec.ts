import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';

function mockContext(user: any, requiredRoles?: UserRole[]) {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(requiredRoles) } as unknown as Reflector;
  const ctx = {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
  return { reflector, ctx };
}

describe('RolesGuard', () => {
  it('allows access when no roles are required', () => {
    const { reflector, ctx } = mockContext({ role: UserRole.CANDIDATE }, undefined);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows access when the user\'s role is in the required list', () => {
    const { reflector, ctx } = mockContext({ role: UserRole.RECRUITER }, [UserRole.RECRUITER, UserRole.ADMIN]);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies access when the user\'s role is not in the required list', () => {
    const { reflector, ctx } = mockContext({ role: UserRole.CANDIDATE }, [UserRole.RECRUITER, UserRole.ADMIN]);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('denies access when there is no authenticated user at all', () => {
    const { reflector, ctx } = mockContext(undefined, [UserRole.RECRUITER]);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx)).toBe(false);
  });
});
