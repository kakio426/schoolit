import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class NaraIliterClient {
  private readonly parser: XMLParser;
  private readonly baseUrl = 'http://apis.data.go.kr/1051000/recruitment/list';

  constructor(private readonly configService: ConfigService) {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  async fetchJobs(pageNo = 1, numOfRows = 100): Promise<any> {
    const apiKey = this.configService.get<string>('NARA_ILITER_API_KEY');
    // Using a public test key if not provided, just for safety in dev, but logically should depend on env
    const serviceKey = apiKey || 'TEST_KEY';

    // Construct URL with query parameters
    const url = `${this.baseUrl}?serviceKey=${serviceKey}&resultType=xml&pageNo=${pageNo}&numOfRows=${numOfRows}&job_type=education`; // Assuming 'education' filter or similar exists, or fetching all

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Nara Iliter: ${response.statusText}`);
    }

    const text = await response.text();
    const result = this.parser.parse(text);

    return result; // Returning the parsed object
  }
}
