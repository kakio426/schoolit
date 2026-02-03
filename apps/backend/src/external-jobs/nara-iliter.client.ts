import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class NaraIliterClient {
  private readonly parser: XMLParser;
  private readonly baseUrl = 'https://openapi.mpm.go.kr/openapi/service/RetrievePblinsttEmpmnInfoService';

  constructor(private readonly configService: ConfigService) {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  async fetchJobs(pageNo = 1, numOfRows = 100): Promise<any> {
    const serviceKey = this.configService.get<string>('NARA_ILITER_API_KEY');
    if (!serviceKey) {
      throw new Error('NARA_ILITER_API_KEY is not configured');
    }

    // Construct URL with query parameters
    const url = `${this.baseUrl}?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Nara Iliter: ${response.statusText}`);
    }

    const text = await response.text();
    const result = this.parser.parse(text);

    return result; // Returning the parsed object
  }
}
