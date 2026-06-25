import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { StorageProvider, UploadResult } from './storage.interface';
import { Readable } from 'stream';

export class CloudinaryProvider implements StorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    destinationFolder?: string
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: destinationFolder || 'fake-news-detection',
          resource_type: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          
          if (!result) {
            return reject(new Error('Cloudinary upload failed: No result returned'));
          }

          resolve({
            url: result.secure_url,
            key: result.public_id,
          });
        }
      );

      // Convert buffer to readable stream and pipe to Cloudinary
      const readableStream = new Readable({
        read() {
          this.push(fileBuffer);
          this.push(null); // End of stream
        }
      });
      
      readableStream.pipe(uploadStream);
    });
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(key);
      return result.result === 'ok';
    } catch (error: any) {
      console.error(`Error deleting file from Cloudinary (key: ${key}):`, error);
      return false;
    }
  }
}

export const cloudinaryProvider = new CloudinaryProvider();
