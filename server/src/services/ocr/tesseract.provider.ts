import { OCRProvider, OCRResult } from './ocr.interface';

/**
 * TesseractProvider is a fallback OCR provider.
 * It uses tesseract.js if available (npm install tesseract.js).
 * If not installed, it throws a clear instructional error at runtime.
 */
export class TesseractProvider implements OCRProvider {
  async extractText(imageUrl: string): Promise<OCRResult> {
    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error('Image URL is required for text extraction.');
    }

    let createWorker: Function;

    try {
      // Use require via indirect call to bypass TypeScript's static module resolution
      // since tesseract.js is an optional peer dependency
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const tesseract = (Function('return require')())('tesseract.js') as any;
      createWorker = tesseract.createWorker;
    } catch {
      throw new Error(
        'TesseractProvider: tesseract.js is not installed. Run: npm install tesseract.js'
      );
    }

    try {
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(imageUrl);
      await worker.terminate();

      return {
        text: (data.text as string).trim(),
        confidence: Math.round(data.confidence as number),
      };
    } catch (error: any) {
      console.error('TesseractProvider error:', error.message);
      throw new Error(`Tesseract OCR failed: ${error.message}`);
    }
  }
}
