import { BusinessProfileController } from './business-profile.controller';
import { BusinessProfileService } from './business-profile.service';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

describe('BusinessProfileController Permissions (TDD)', () => {
  let controller: BusinessProfileController;
  let service: BusinessProfileService;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    // minimally mock service
    service = {} as any;
    controller = new BusinessProfileController(service);
  });

  it('findAll() should exist and allow TEACHER and SCHOOL', () => {
    if (!controller.findAll) {
      throw new Error('findAll method is not defined yet (Red Phase)');
    }
    const roles = reflector.get<Role[]>(ROLES_KEY, controller.findAll);
    expect(roles).toContain(Role.TEACHER);
    expect(roles).toContain(Role.SCHOOL);
  });
});
