import { OCRProvider } from './ocr.interface';
import { GoogleVisionProvider } from './google-vision.provider';
import { TesseractProvider } from './tesseract.provider';

export type OCRProviderType = 'google-vision' | 'tesseract';

export class OCRFactory {
  /**
   * Returns an OCR provider instance based on the requested type.
   * Defaults to GoogleVisionProvider if GOOGLE_APPLICATION_CREDENTIALS is set,
   * otherwise falls back to TesseractProvider.
   *
   * @param type - (Optional) Explicit provider type to use.
   * @returns An OCRProvider instance.
   */
  static create(type?: OCRProviderType): OCRProvider {
    // Allow explicit overrides
    if (type === 'tesseract') {
      return new TesseractProvider();
    }

    if (type === 'google-vision') {
      return new GoogleVisionProvider();
    }

    // Auto-select based on environment: prefer Google Vision if credentials are available
    const hasGoogleCredentials =
      !!process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      !!process.env.GOOGLE_CLOUD_PROJECT;

    if (hasGoogleCredentials) {
      console.info('[OCRFactory] Using GoogleVisionProvider');
      return new GoogleVisionProvider();
    }

    // Fallback to Tesseract
    console.warn('[OCRFactory] GOOGLE_APPLICATION_CREDENTIALS not set. Falling back to TesseractProvider.');
    return new TesseractProvider();
  }
}

// Singleton instance using the factory
export const ocrProvider: OCRProvider = OCRFactory.create();
