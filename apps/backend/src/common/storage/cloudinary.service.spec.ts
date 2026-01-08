import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';

// Mock cloudinary module
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-api-key',
        CLOUDINARY_API_SECRET: 'test-api-secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should configure cloudinary with environment variables', () => {
      expect(cloudinary.config).toHaveBeenCalledWith({
        cloud_name: 'test-cloud',
        api_key: 'test-api-key',
        api_secret: 'test-api-secret',
      });
    });
  });

  describe('uploadFile', () => {
    it('should upload file and return public_id', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const mockResult = {
        public_id: 'edupin/posts/test-image-123',
        secure_url:
          'https://res.cloudinary.com/test-cloud/image/upload/edupin/posts/test-image-123',
      };

      // Mock upload_stream
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        // Callback 호출을 시뮬레이션
        setTimeout(() => callback(null, mockResult), 0);
        return {
          end: jest.fn(),
        };
      });

      const result = await service.uploadFile(mockFile, 'posts');

      expect(result).toBe('edupin/posts/test-image-123');
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'edupin/posts',
          resource_type: 'auto',
        }),
        expect.any(Function),
      );
    });

    it('should reject on upload error', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const mockError = new Error('Upload failed');

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        setTimeout(() => callback(mockError, null), 0);
        return {
          end: jest.fn(),
        };
      });

      await expect(service.uploadFile(mockFile, 'posts')).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'ok',
      });

      await expect(service.deleteFile('edupin/posts/test-image-123')).resolves.not.toThrow();

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('edupin/posts/test-image-123');
    });

    it('should handle deletion error', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteFile('edupin/posts/test-image-123')).rejects.toThrow(
        'Delete failed',
      );
    });
  });

  describe('getFileUrl', () => {
    it('should generate correct Cloudinary URL', () => {
      const imageId = 'edupin/posts/test-image-123';
      const result = service.getFileUrl(imageId);

      expect(result).toBe(
        'https://res.cloudinary.com/test-cloud/image/upload/edupin/posts/test-image-123',
      );
    });

    it('should return empty string for empty imageId', () => {
      expect(service.getFileUrl('')).toBe('');
    });
  });

  describe('getOptimizedUrl', () => {
    it('should generate URL with transformations', () => {
      const imageId = 'edupin/posts/test-image-123';
      const result = service.getOptimizedUrl(imageId, {
        width: 300,
        height: 200,
      });

      expect(result).toContain('w_300');
      expect(result).toContain('h_200');
      expect(result).toContain('q_auto');
      expect(result).toContain('f_auto');
    });

    it('should return empty string for empty imageId', () => {
      expect(service.getOptimizedUrl('')).toBe('');
    });
  });
});
