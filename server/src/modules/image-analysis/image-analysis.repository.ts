import { Model, Types } from 'mongoose';
import { ImageAnalysis, IImageAnalysis, ProcessingStatus } from './image-analysis.model';

export class ImageAnalysisRepository {
  private readonly model: Model<IImageAnalysis>;

  constructor(model: Model<IImageAnalysis> = ImageAnalysis) {
    this.model = model;
  }

  async create(data: Partial<IImageAnalysis>): Promise<IImageAnalysis> {
    const analysis = new this.model(data);
    return await analysis.save();
  }

  async findById(id: string | Types.ObjectId): Promise<IImageAnalysis | null> {
    return await this.model.findById(id).exec();
  }

  async update(id: string | Types.ObjectId, data: Partial<IImageAnalysis>): Promise<IImageAnalysis | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateStatus(
    id: string | Types.ObjectId,
    status: ProcessingStatus,
    errorMessage?: string
  ): Promise<IImageAnalysis | null> {
    const updateData: Partial<IImageAnalysis> = { processingStatus: status };
    
    if (errorMessage !== undefined) {
      updateData.errorMessage = errorMessage;
    }

    return await this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async getUserHistory(userId: string | Types.ObjectId): Promise<IImageAnalysis[]> {
    return await this.model.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export const imageAnalysisRepository = new ImageAnalysisRepository();
