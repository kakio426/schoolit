import { Test, TestingModule } from '@nestjs/testing';
import { MatchingController } from './matching.controller';
import { UserService } from '../users/user.service';
import { MatchingService } from './matching.service';

describe('MatchingController', () => {
  let controller: MatchingController;

  const mockMatchingService = {};
  const mockUserService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchingController],
      providers: [
        { provide: MatchingService, useValue: mockMatchingService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<MatchingController>(MatchingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
