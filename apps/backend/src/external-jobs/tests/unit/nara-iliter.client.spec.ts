import { NaraIliterClient } from '../../nara-iliter.client';
import { ConfigService } from '@nestjs/config';

// Mock ConfigService
const mockConfigService = {
  get: jest.fn(),
};

// Simple fetch mock
global.fetch = jest.fn();

describe('NaraIliterClient', () => {
  let client: NaraIliterClient;

  beforeEach(() => {
    client = new NaraIliterClient(mockConfigService as unknown as ConfigService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should fetch jobs successfully and return parsed data', async () => {
    // Mock XML response from API
    const mockXmlResponse = `
        <response>
            <body />
            <header>
                <resultCode>00</resultCode>
                <resultMsg>NORMAL SERVICE.</resultMsg>
            </header>
            <items>
                <item>
                    <hireTitle>Elementary Teacher</hireTitle>
                    <workRegion>Seoul</workRegion>
                </item>
            </items>
        </response>`;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(mockXmlResponse),
    });

    const result = await client.fetchJobs();
    expect(result).toBeDefined();
  });

  it('should throw error on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    await expect(client.fetchJobs()).rejects.toThrow();
  });
});
