import { Test, TestingModule } from '@nestjs/testing';
import { SimpleService } from './simple.service';

describe('SimpleService', () => {
  let service: SimpleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimpleService],
    }).compile();

    service = module.get<SimpleService>(SimpleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
