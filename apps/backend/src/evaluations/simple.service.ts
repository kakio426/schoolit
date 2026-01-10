import { Injectable } from '@nestjs/common';

@Injectable()
export class SimpleService {
    getHello(): string {
        return 'Hello World!';
    }
}
