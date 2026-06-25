import { ImageAnnotatorClient } from '@google-cloud/vision';
import { OCRProvider, OCRResult } from './ocr.interface';

export class GoogleVisionProvider implements OCRProvider {
  private client: ImageAnnotatorClient;
    

  constructor() {
    // Initializes the client. 
    // It will automatically use the GOOGLE_APPLICATION_CREDENTIALS environment variable
    // for authentication if deployed or set locally.
    this.client = new ImageAnnotatorClient();
  }

  async extractText(imageUrl: string): Promise<OCRResult> {
    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error('Image URL is required for text extraction.');
    }

    try {
      // Performs text detection on the remote image URL
      const [result] = await this.client.textDetection(imageUrl);
      
      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        return {
          text: '',
          confidence: 0,
        };
      }

      // The first element in textAnnotations contains the entire extracted text
      const fullTextAnnotation = detections[0];
      const text = fullTextAnnotation.description || '';
      
      // Calculate an average confidence score based on the detailed fullTextAnnotation
      let confidence = 0;
      const fullText = result.fullTextAnnotation;
      
      if (fullText && fullText.pages && fullText.pages.length > 0) {
        let totalConfidence = 0;
        let blockCount = 0;

        for (const page of fullText.pages) {
          if (page.blocks) {
            for (const block of page.blocks) {
              if (block.confidence !== undefined && block.confidence !== null) {
                totalConfidence += block.confidence;
                blockCount++;
              }
            }
          }
        }

        if (blockCount > 0) {
          // Vision API confidence is on a 0.0 to 1.0 scale, converting to 0-100 scale
          confidence = (totalConfidence / blockCount) * 100;
        } else {
          // Fallback if text was found but no block-level confidence is detailed
          confidence = 80;
        }
      } else {
        // Fallback confidence
        confidence = text.length > 0 ? 80 : 0;
      }

      return {
        text: text.trim(),
        confidence: Math.round(confidence),
      };
    } catch (error: any) {
      console.error('Error during Google Vision OCR extraction:', error.message);
      throw new Error(`OCR Extraction failed: ${error.message}`);
    }
  }
}

export const googleVisionProvider = new GoogleVisionProvider();
