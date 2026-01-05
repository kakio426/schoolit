import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';
import { ConfigService } from '@nestjs/config';

describe('EncryptionService', () => {
  let service: EncryptionService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'ENCRYPTION_KEY') {
        return '12345678901234567890123456789012'; // 32 bytes for AES-256
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt & decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const plainText = 'sensitive-data-123';
      const encrypted = service.encrypt(plainText);

      expect(encrypted).not.toBe(plainText);
      expect(encrypted).toContain(':'); // IV and content separator

      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(plainText);
    });

    it('should produce different outputs for same input (due to random IV)', () => {
      const plainText = 'same-data';
      const encrypted1 = service.encrypt(plainText);
      const encrypted2 = service.encrypt(plainText);

      expect(encrypted1).not.toBe(encrypted2);

      expect(service.decrypt(encrypted1)).toBe(plainText);
      expect(service.decrypt(encrypted2)).toBe(plainText);
    });
  });
});
