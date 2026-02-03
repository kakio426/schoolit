import { WorknetClient } from '../../worknet.client';
import { ConfigService } from '@nestjs/config';

// Mock ConfigService
const mockConfigService = {
  get: jest.fn(),
};

// Simple fetch mock
global.fetch = jest.fn();

describe('WorknetClient', () => {
  let client: WorknetClient;

  beforeEach(() => {
    client = new WorknetClient(mockConfigService as unknown as ConfigService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should fetch jobs successfully and return parsed data', async () => {
    // Mock JSON response from API
    const mockResponse = {
      wantedRoot: {
        total: 1,
        wanted: [
          {
            wantedAuthNo: '12345',
            company: 'Test School',
            title: 'After-school Teacher',
            salTpNm: 'Hourly',
            sal: '30000',
            region: 'Seoul',
          },
        ],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await client.fetchJobs();
    expect(result).toBeDefined();
  });

  it('should throw error on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
    });

    await expect(client.fetchJobs()).rejects.toThrow();
  });
});
