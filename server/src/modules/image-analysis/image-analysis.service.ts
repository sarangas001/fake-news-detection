import { IImageAnalysis, ProcessingStatus } from './image-analysis.model';
import { imageAnalysisRepository, ImageAnalysisRepository } from './image-analysis.repository';
import { cloudinaryProvider, CloudinaryProvider } from '../../services/storage/cloudinary.provider';
import { ocrProvider } from '../../services/ocr/ocr.factory';
import { newsAnalysisService } from '../news-analysis/news-analysis.service';
import { NewsAnalysisConstants } from '../news-analysis/news-analysis.constants';
import { Types } from 'mongoose';

export interface UploadAndAnalyzeResult {
  imageAnalysisId: string;
  processingStatus: ProcessingStatus;
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class ImageAnalysisService {
  constructor(
    private readonly repository: ImageAnalysisRepository = imageAnalysisRepository,
    private readonly storageProvider: CloudinaryProvider = cloudinaryProvider
  ) {}

  async uploadAndAnalyze(
    userId: string,
    file: Express.Multer.File
  ): Promise<UploadAndAnalyzeResult> {
    // Step 1: Validate file
    if (!file) {
      throw new Error('No file provided.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File too large. Maximum allowed size is 10MB.`);
    }

    // Step 2: Upload to Cloudinary
    const uploadResult = await this.storageProvider.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      'image-analysis'
    );

    // Step 3: Create DB record
    const record = await this.repository.create({
      userId: userId as any,
      imageUrl: uploadResult.url,
      storageKey: uploadResult.key,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      processingStatus: ProcessingStatus.PENDING,
    });

    const recordId = String(record._id);

    try {
      await this.repository.updateStatus(recordId, ProcessingStatus.PROCESSING);

      const ocrResult = await ocrProvider.extractText(uploadResult.url);

      if (!ocrResult.text || ocrResult.text.trim() === '') {
        throw new Error('OCR extraction returned empty text.');
      }

      await this.repository.update(recordId, {
        extractedText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
      });

      let analysisId = record.linkedAnalysisId;

      if (!analysisId) {
        const analysisResponse = await newsAnalysisService.createAnalysis(String(userId), {
          contentType: NewsAnalysisConstants.CONTENT_TYPES.OCR,
          content: ocrResult.text,
        });

        analysisId = new Types.ObjectId(analysisResponse.analysisId);

        await this.repository.update(recordId, {
          linkedAnalysisId: analysisId,
        });
      }

      await this.repository.updateStatus(recordId, ProcessingStatus.COMPLETED);
    } catch (error: any) {
      await this.repository.updateStatus(recordId, ProcessingStatus.FAILED, error.message);
      throw error;
    }

    // Step 5: Return ID
    return {
      imageAnalysisId: recordId,
      processingStatus: ProcessingStatus.COMPLETED,
    };
  }

  async getResult(imageAnalysisId: string): Promise<IImageAnalysis | null> {
    const record = await this.repository.findById(imageAnalysisId);

    if (!record) {
      throw new Error(`Image analysis record not found: ${imageAnalysisId}`);
    }

    return record;
  }

  async getHistory(userId: string): Promise<IImageAnalysis[]> {
    return await this.repository.getUserHistory(userId);
  }

  async delete(imageAnalysisId: string): Promise<boolean> {
    const record = await this.repository.findById(imageAnalysisId);

    if (!record) {
      throw new Error(`Image analysis record not found: ${imageAnalysisId}`);
    }

    // Delete the file from Cloudinary if a storage key exists
    if (record.storageKey) {
      await this.storageProvider.delete(record.storageKey);
    }

    return await this.repository.delete(imageAnalysisId);
  }
}

export const imageAnalysisService = new ImageAnalysisService();
