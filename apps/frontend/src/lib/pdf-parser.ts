import * as pdfjsLib from 'pdfjs-dist';

// Worker 설정 (CDN 사용)
// 버전 불일치 방지를 위해 현재 설치된 버전의 CDN Worker 사용
if (typeof window !== 'undefined' && 'Worker' in window) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Extracts text content from a PDF file using pdf.js
 * @param file The PDF file object
 * @returns Extracted text string
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();

        // Document 로드
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const totalPages = pdf.numPages;

        // 모든 페이지 순회
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // 텍스트 아이템 결합 (공백 처리 개선)
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        return fullText;
    } catch (error) {
        console.error('PDF Parsing Error:', error);
        throw new Error('PDF 텍스트 추출 중 오류가 발생했습니다.');
    }
};
