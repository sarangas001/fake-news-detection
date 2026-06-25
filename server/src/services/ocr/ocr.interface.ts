export interface OCRResult {
  text: string;
  confidence: number;
}

export interface OCRProvider {
  /**
   * Extracts text from an image URL using Optical Character Recognition (OCR).
   * 
   * @param imageUrl - The public URL of the image to process.
   * @returns A promise that resolves to an OCRResult containing the extracted text and confidence score (typically 0-100).
   */
  extractText(imageUrl: string): Promise<OCRResult>;
}
