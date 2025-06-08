export interface FileMetadata {
  filename: string;
  mimetype: string;
  size: number;
}

export interface StoredFileMetadata extends FileMetadata {
  path: string;
  url: string;
}

export interface IFileStorage {
  /**
   * Store a file and return its metadata
   * @param file The file buffer to store
   * @param metadata The file metadata
   * @returns The stored file metadata including path and URL
   */
  store(file: Buffer, metadata: FileMetadata): Promise<StoredFileMetadata>;

  /**
   * Delete a stored file
   * @param path The file path to delete
   */
  delete(path: string): Promise<void>;

  /**
   * Get the URL for a stored file
   * @param path The file path
   * @returns The public URL for the file
   */
  getUrl(path: string): Promise<string>;
}
