import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

describe('JobsController Permissions (TDD)', () => {
  let controller: JobsController;
  let worksService: JobsService;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('create() should allow TEACHER role', () => {
    const roles = reflector.get<Role[]>(ROLES_KEY, JobsController.prototype.create);
    expect(roles).toBeDefined();
    // This expects to fail initially as only SCHOOL is allowed
    expect(roles).toContain(Role.TEACHER);
    expect(roles).toContain(Role.SCHOOL);
  });

  it('update() should allow TEACHER role', () => {
    const roles = reflector.get<Role[]>(ROLES_KEY, JobsController.prototype.update);
    expect(roles).toBeDefined();
    expect(roles).toContain(Role.TEACHER);
    expect(roles).toContain(Role.SCHOOL);
  });
});
