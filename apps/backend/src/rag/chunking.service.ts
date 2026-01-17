import { Injectable } from '@nestjs/common';

export interface DocumentChunk {
  content: string;
  metadata: {
    source: string;
    page?: number;
    chunkIndex: number;
  };
}

@Injectable()
export class ChunkingService {
  private readonly CHUNK_SIZE = 800;
  private readonly CHUNK_OVERLAP = 100;

  /**
   * Split text into overlapping chunks for better context preservation
   * @param text - Full document text
   * @param source - Source filename for metadata
   * @returns Array of document chunks with metadata
   */
  splitTextIntoChunks(text: string, source: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    let startIndex = 0;
    let chunkIndex = 0;

    // Clean up text - remove excessive whitespace
    const cleanedText = text.replace(/\s+/g, ' ').trim();

    while (startIndex < cleanedText.length) {
      const endIndex = Math.min(startIndex + this.CHUNK_SIZE, cleanedText.length);

      let chunkText = cleanedText.slice(startIndex, endIndex);

      // Find sentence boundary for cleaner cuts
      if (endIndex < cleanedText.length) {
        chunkText = this.findSentenceBoundary(chunkText);
      }

      if (chunkText.trim().length > 0) {
        chunks.push({
          content: chunkText.trim(),
          metadata: {
            source,
            chunkIndex: chunkIndex++,
          },
        });
      }

      // Move start index with overlap
      startIndex += chunkText.length - this.CHUNK_OVERLAP;

      // Prevent infinite loop
      if (chunkText.length < this.CHUNK_OVERLAP) {
        break;
      }
    }

    return chunks;
  }

  /**
   * Find the last sentence boundary in text for cleaner cuts
   */
  private findSentenceBoundary(text: string): string {
    // Korean and English sentence endings
    const sentenceEndings = ['.', '?', '!', '다.', '요.', '니다.'];

    let lastBoundary = -1;
    for (const ending of sentenceEndings) {
      const idx = text.lastIndexOf(ending);
      if (idx > lastBoundary) {
        lastBoundary = idx + ending.length;
      }
    }

    // If found a boundary in the last 30% of the chunk, use it
    if (lastBoundary > text.length * 0.7) {
      return text.slice(0, lastBoundary);
    }

    return text;
  }

  /**
   * Split text by pages if page markers are present
   * @param text - Full document text with page markers
   * @param source - Source filename
   * @returns Array of chunks with page numbers in metadata
   */
  splitByPages(text: string, source: string): DocumentChunk[] {
    try {
      // Try to detect page breaks (common in PDF extraction)
      const pagePattern = /\f|--- Page \d+ ---/g;
      const pages = text.split(pagePattern);

      const allChunks: DocumentChunk[] = [];

      pages.forEach((pageText, pageIndex) => {
        const pageChunks = this.splitTextIntoChunks(pageText, source);
        pageChunks.forEach((chunk) => {
          allChunks.push({
            ...chunk,
            metadata: {
              ...chunk.metadata,
              page: pageIndex + 1,
            },
          });
        });
      });

      return allChunks;
    } catch (error) {
      // Safety Net: Log error and return empty array to prevent 500 crash in caller
      // Use console.error if logger is not available context-wise, but here we let exception bubble or handle gracefully
      // To strictly follow user's instruction: "침묵하지 말고 빈 상자라도 내놔라"
      console.error(`[ChunkingService] Fatal Error in splitByPages: ${error.message}`, error.stack);
      return [];
    }
  }
}
