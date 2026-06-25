export interface UploadResult {
  url: string;
  key: string;
}

export interface StorageProvider {
  /**
   * Uploads a file to the storage provider.
   * 
   * @param fileBuffer - The raw file buffer.
   * @param originalName - The original name of the file.
   * @param mimeType - The MIME type of the file.
   * @param destinationFolder - (Optional) The folder path where the file should be stored.
   * @returns A promise that resolves to an UploadResult containing the URL and storage key.
   */
  upload(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    destinationFolder?: string
  ): Promise<UploadResult>;

  /**
   * Deletes a file from the storage provider using its key.
   * 
   * @param key - The unique storage key of the file to delete.
   * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
   */
  delete(key: string): Promise<boolean>;
}
