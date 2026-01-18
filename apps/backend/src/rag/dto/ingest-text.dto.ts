
export class IngestTextDto {
    content: string;
    filename: string;

    // 👇 이 부분이 빠져있어서 400 에러가 났습니다. 추가해주세요!
    metadata?: Record<string, any>;
}
