import { Model, Types } from 'mongoose';
import { FactCheckReport, IFactCheckReport, IFactCheckReportDocument } from './fact-check-report.model';

export class FactCheckRepository {
  private readonly model: Model<IFactCheckReportDocument>;

  constructor(model: Model<IFactCheckReportDocument> = FactCheckReport) {
    this.model = model;
  }

  async create(data: Partial<IFactCheckReport>): Promise<IFactCheckReportDocument> {
    const report = new this.model(data);
    return await report.save();
  }

  async findById(id: string | Types.ObjectId): Promise<IFactCheckReportDocument | null> {
    return await this.model.findById(id).exec();
  }

  async findByAnalysisId(analysisId: string | Types.ObjectId): Promise<IFactCheckReportDocument[]> {
    return await this.model.find({ analysisId }).exec();
  }

  async update(id: string | Types.ObjectId, data: Partial<IFactCheckReport>): Promise<IFactCheckReportDocument | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export const factCheckRepository = new FactCheckRepository();
