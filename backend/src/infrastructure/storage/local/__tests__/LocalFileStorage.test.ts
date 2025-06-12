import fs from 'fs/promises';
import path from 'path';
import { LocalFileStorage } from '../LocalFileStorage';
import { FileMetadata } from '../../../../domain/ports/IFileStorage';

jest.mock('fs/promises');

describe('LocalFileStorage', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const testUploadDir = 'test-uploads';
  const testBaseUrl = 'http://test.com/uploads';
  let storage: LocalFileStorage;

  beforeEach(() => {
    storage = new LocalFileStorage(testUploadDir, testBaseUrl);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use default values when no parameters provided', () => {
      const defaultStorage = new LocalFileStorage();
      expect(defaultStorage['uploadDir']).toBe('uploads');
      expect(defaultStorage['baseUrl']).toBe('http://localhost:3000/uploads');
    });

    it('should use custom values when provided', () => {
      expect(storage['uploadDir']).toBe(testUploadDir);
      expect(storage['baseUrl']).toBe(testBaseUrl);
    });
  });

  describe('store', () => {
    const testFile: Buffer = Buffer.from('test file content');
    const testMetadata: FileMetadata = {
      filename: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 17,
    };

    beforeEach(() => {
      // Mock Date.now() to return a fixed timestamp
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    });

    it('should create upload directory if it does not exist', async () => {
      await storage.store(testFile, testMetadata);
      expect(mockFs.mkdir).toHaveBeenCalledWith(testUploadDir, {
        recursive: true,
      });
    });

    it('should write file to disk with unique filename', async () => {
      const result = await storage.store(testFile, testMetadata);
      const expectedPath = path.join(testUploadDir, '1234567890-test.jpg');

      expect(mockFs.writeFile).toHaveBeenCalledWith(expectedPath, testFile);
      expect(result).toEqual({
        ...testMetadata,
        path: expectedPath,
        url: `${testBaseUrl}/1234567890-test.jpg`,
      });
    });

    it('should handle filenames with special characters', async () => {
      const specialMetadata: FileMetadata = {
        filename: 'test file with spaces!@#$.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      };
      const result = await storage.store(testFile, specialMetadata);
      expect(result.path).toContain('1234567890-test file with spaces!@#$.jpg');
    });

    it('should handle mkdir failure', async () => {
      const error = new Error('Permission denied');
      mockFs.mkdir.mockRejectedValueOnce(error);

      await expect(storage.store(testFile, testMetadata)).rejects.toThrow('Permission denied');
    });

    it('should handle writeFile failure', async () => {
      const error = new Error('Disk full');
      mockFs.writeFile.mockRejectedValueOnce(error);

      await expect(storage.store(testFile, testMetadata)).rejects.toThrow('Disk full');
    });

    it('should handle empty filename', async () => {
      const emptyMetadata: FileMetadata = {
        filename: '',
        mimetype: 'image/jpeg',
        size: 1024,
      };

      await expect(storage.store(testFile, emptyMetadata)).rejects.toThrow('Invalid filename');
    });

    it('should handle zero-byte files', async () => {
      const emptyFile = Buffer.from('');
      const result = await storage.store(emptyFile, testMetadata);
      expect(result.size).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete file from disk', async () => {
      const testPath = 'test-uploads/test.jpg';
      await storage.delete(testPath);
      expect(mockFs.unlink).toHaveBeenCalledWith(testPath);
    });

    it('should ignore error if file does not exist', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.unlink.mockRejectedValueOnce(error);

      await expect(storage.delete('non-existent.jpg')).resolves.not.toThrow();
    });

    it('should throw other errors', async () => {
      const error = new Error('Permission denied');
      mockFs.unlink.mockRejectedValueOnce(error);

      await expect(storage.delete('test.jpg')).rejects.toThrow('Permission denied');
    });

    it('should handle paths with special characters', async () => {
      const specialPath = 'test-uploads/file with spaces!@#$.jpg';
      await storage.delete(specialPath);
      expect(mockFs.unlink).toHaveBeenCalledWith(specialPath);
    });

    it('should handle empty path', async () => {
      await expect(storage.delete('')).rejects.toThrow('Invalid file path');
    });
  });

  describe('getUrl', () => {
    it('should return public URL for file', async () => {
      const testPath = 'test-uploads/test.jpg';
      const url = await storage.getUrl(testPath);
      expect(url).toBe(`${testBaseUrl}/test.jpg`);
    });

    it('should throw error for invalid path', async () => {
      await expect(storage.getUrl('')).rejects.toThrow('Invalid file path');
    });

    it('should handle paths with special characters', async () => {
      const specialPath = 'test-uploads/file with spaces!@#$.jpg';
      const url = await storage.getUrl(specialPath);
      expect(url).toBe(`${testBaseUrl}/file with spaces!@#$.jpg`);
    });

    it('should handle paths with forward slashes', async () => {
      const nestedPath = 'test-uploads/subfolder/test.jpg';
      const url = await storage.getUrl(nestedPath);
      expect(url).toBe(`${testBaseUrl}/test.jpg`);
    });

    it('should handle paths with backslashes', async () => {
      const windowsPath = 'test-uploads\\test.jpg';
      const url = await storage.getUrl(windowsPath);
      expect(url).toBe(`${testBaseUrl}/test.jpg`);
    });

    it('should handle paths ending with slash', async () => {
      const invalidPath = 'test-uploads/subfolder/';
      await expect(storage.getUrl(invalidPath)).rejects.toThrow('Invalid file path');
    });
  });
});
