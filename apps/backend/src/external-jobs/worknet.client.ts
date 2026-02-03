import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WorknetClient {
  private readonly baseUrl = 'http://openapi.work.go.kr/opi/opi/opia/wantedApi.do';

  constructor(private readonly configService: ConfigService) {}

  async fetchJobs(pageNo = 1, numOfRows = 100): Promise<any> {
    const authKey = this.configService.get<string>('WORKNET_API_KEY');
    const serviceKey = authKey || 'TEST_KEY';

    // Worknet usually uses 'startPage', 'display' instead of 'pageNo', 'numOfRows'
    // and 'returnType=JSON' might be supported
    const url = `${this.baseUrl}?authKey=${serviceKey}&callTp=L&returnType=JSON&startPage=${pageNo}&display=${numOfRows}&occupation=20`; // 20 seems to be education related or similar, simplified

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Worknet: ${response.statusText}`);
    }

    // Assuming JSON response as per test
    const result = await response.json();
    return result;
  }
}
