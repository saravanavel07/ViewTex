export interface ChunkingConfig {
  chunkSize: number; // default ~500 tokens / chars
  chunkOverlap: number; // default ~80 tokens / chars
  strategy: 'paragraph' | 'section' | 'sentence' | 'fixed';
}

export interface ChunkMetadata {
  document_id: string;
  chunk_id: string;
  page?: number;
  section: string;
  text: string;
  source: string;
  title: string;
  timestamp: string;
  token_count: number;
}

export class DocumentChunker {
  public static chunkDocument(
    docId: string,
    title: string,
    source: string,
    rawText: string,
    config: ChunkingConfig = { chunkSize: 500, chunkOverlap: 80, strategy: 'section' }
  ): ChunkMetadata[] {
    const cleanText = rawText.replace(/\r\n/g, '\n').trim();
    if (!cleanText) return [];

    const chunks: ChunkMetadata[] = [];
    const timestamp = new Date().toISOString();

    // 1. Section & Header aware segmentation
    const sectionBlocks = cleanText.split(/\n(?=(?:#{1,4}\s|[A-Z0-9_.\s]{3,30}:|\n))/g);
    let chunkIndex = 0;
    let currentPage = 1;

    sectionBlocks.forEach((block) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;

      // Extract section title if present
      const firstLine = trimmedBlock.split('\n')[0].trim();
      const isHeader = /^#{1,4}\s/.test(firstLine) || /^[A-Z0-9_\s]{3,40}:?$/.test(firstLine);
      const sectionName = isHeader ? firstLine.replace(/^#{1,4}\s*/, '').replace(/:$/, '') : `Section ${chunkIndex + 1}`;
      
      const bodyContent = isHeader ? trimmedBlock.substring(firstLine.length).trim() : trimmedBlock;
      if (!bodyContent && isHeader) return;

      // Paragraph level splitting within section
      const paragraphs = (bodyContent || trimmedBlock).split(/\n\s*\n/).filter((p) => p.trim().length > 0);

      let currentBuffer = '';
      paragraphs.forEach((para) => {
        const paraTokens = para.split(/\s+/).length;

        // Approximate 1 word ≈ 1.3 tokens
        if (currentBuffer.length + para.length <= config.chunkSize * 4) {
          currentBuffer += (currentBuffer ? '\n\n' : '') + para;
        } else {
          if (currentBuffer.trim()) {
            chunkIndex++;
            currentPage = Math.floor((chunkIndex - 1) / 3) + 1;
            chunks.push({
              document_id: docId,
              chunk_id: `chunk_${chunkIndex}`,
              page: currentPage,
              section: sectionName,
              text: currentBuffer.trim(),
              source,
              title,
              timestamp,
              token_count: currentBuffer.split(/\s+/).length,
            });
          }

          // Overlap buffer setup
          const words = currentBuffer.split(/\s+/);
          const overlapWords = words.slice(-Math.min(words.length, Math.floor(config.chunkOverlap / 2))).join(' ');
          currentBuffer = (overlapWords ? overlapWords + ' ' : '') + para;
        }
      });

      if (currentBuffer.trim()) {
        chunkIndex++;
        currentPage = Math.floor((chunkIndex - 1) / 3) + 1;
        chunks.push({
          document_id: docId,
          chunk_id: `chunk_${chunkIndex}`,
          page: currentPage,
          section: sectionName,
          text: currentBuffer.trim(),
          source,
          title,
          timestamp,
          token_count: currentBuffer.split(/\s+/).length,
        });
      }
    });

    return chunks;
  }
}
