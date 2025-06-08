import fs from 'fs/promises';
import path from 'path';
import { FileMetadata, IFileStorage, StoredFileMetadata } from '../../../domain/ports/IFileStorage';

export class LocalFileStorage implements IFileStorage {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(uploadDir: string = 'uploads', baseUrl: string = 'http://localhost:3000/uploads') {
    this.uploadDir = uploadDir;
    this.baseUrl = baseUrl;
  }

  async store(file: Buffer, metadata: FileMetadata): Promise<StoredFileMetadata> {
    if (!metadata.filename) {
      throw new Error('Invalid filename');
    }

    await fs.mkdir(this.uploadDir, { recursive: true });

    // unique filename with timestamp and original name
    const timestamp = Date.now();
    const filename = `${timestamp}-${metadata.filename}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.writeFile(filePath, file);

    return {
      ...metadata,
      size: file.length,
      path: filePath,
      url: `${this.baseUrl}/${filename}`,
    };
  }

  async delete(path: string): Promise<void> {
    if (!path) {
      throw new Error('Invalid file path');
    }

    try {
      await fs.unlink(path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      // Ignore error if file doesn't exist
    }
  }

  async getUrl(filePath: string): Promise<string> {
    const filename = filePath.split(/[/\\]/).pop();
    if (!filename) {
      throw new Error('Invalid file path');
    }
    return `${this.baseUrl}/${filename}`;
  }
}
