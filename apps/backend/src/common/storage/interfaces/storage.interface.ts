/**
 * Storage Service Interface
 *
 * 이 인터페이스를 통해 Storage Provider(Cloudinary, S3, GCS 등)를 추상화합니다.
 * 비즈니스 로직은 이 인터페이스에만 의존하므로, Provider 교체 시 구현체만 바꾸면 됩니다.
 */
export interface IStorageService {
    /**
     * 파일을 업로드하고 고유 ID를 반환합니다.
     * @param file - Multer로 받은 파일 객체
     * @param folder - 저장할 폴더 경로 (e.g., 'posts', 'reviews', 'profiles')
     * @returns 저장소의 고유 ID (public_id)
     */
    uploadFile(file: Express.Multer.File, folder: string): Promise<string>;

    /**
     * 파일을 삭제합니다.
     * @param imageId - 저장소의 고유 ID
     */
    deleteFile(imageId: string): Promise<void>;

    /**
     * 고유 ID로 실제 URL을 생성합니다.
     * @param imageId - 저장소의 고유 ID
     * @returns 전체 URL (e.g., https://res.cloudinary.com/...)
     */
    getFileUrl(imageId: string): string;

    /**
     * Buffer 데이터를 업로드합니다. (Base64 인코딩 지원)
     * @param buffer - 파일 버퍼
     * @param folder - 저장할 폴더 경로
     * @param filename - 파일명 (optional)
     * @returns 저장소의 고유 ID
     */
    uploadBuffer?(
        buffer: Buffer,
        folder: string,
        filename?: string,
    ): Promise<string>;
}

export const STORAGE_SERVICE = 'IStorageService';
