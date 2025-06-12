import { Request } from 'express';
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import { Readable } from 'stream';
import config from '../../../infrastructure/config';

// Mock config
jest.mock('../../../infrastructure/config', () => ({
  __esModule: true,
  default: {
    uploads: {
      profilePictures: {
        path: path.join(process.cwd(), 'test-uploads', 'profile-pictures'),
        url: '/uploads/profile-pictures',
      },
    },
  },
}));

// Import after mocking config
import { upload } from '../FileUploadMiddleware';

describe('FileUploadMiddleware', () => {
  const mockRequest = {
    headers: {
      'content-type': 'multipart/form-data',
    },
  } as unknown as Request;

  const createMockFile = (
    originalname: string,
    mimetype: string,
    content: Buffer,
  ): Express.Multer.File => {
    const stream = new Readable();
    stream.push(content);
    stream.push(null);

    return {
      fieldname: 'profilePicture',
      originalname,
      encoding: '7bit',
      mimetype,
      size: content.length,
      destination: config.uploads.profilePictures.path,
      filename: originalname,
      path: path.join(config.uploads.profilePictures.path, originalname),
      buffer: content,
      stream: stream,
    } as Express.Multer.File;
  };

  beforeAll(async () => {
    // Ensure test upload directory exists and is empty
    await fs.mkdir(config.uploads.profilePictures.path, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test files
    await fs.rm(config.uploads.profilePictures.path, { recursive: true, force: true });
  });

  describe('file type validation', () => {
    it('should accept valid image types', (done) => {
      const fileFilter = (upload as any).fileFilter;
      const file = createMockFile('test.jpg', 'image/jpeg', Buffer.from('test image content'));

      fileFilter(mockRequest, file, (err: any, acceptFile: boolean) => {
        expect(err).toBeNull();
        expect(acceptFile).toBe(true);
        done();
      });
    });

    it('should reject invalid file types', (done) => {
      const fileFilter = (upload as any).fileFilter;
      const file = createMockFile('test.txt', 'text/plain', Buffer.from('test text content'));

      fileFilter(mockRequest, file, (err: any, acceptFile: boolean) => {
        expect(err).toBeDefined();
        expect(err.message).toBe('Invalid file type. Only JPEG, PNG and GIF images are allowed.');
        done();
      });
    });
  });

  describe('storage configuration', () => {
    it('should set correct destination', (done) => {
      const diskStorage = multer.diskStorage({
        destination: (upload as any).storage.getDestination,
        filename: (upload as any).storage.getFilename,
      });

      const fileBuffer = Buffer.from('test image content');
      const file = createMockFile('test.jpg', 'image/jpeg', fileBuffer);

      diskStorage._handleFile(mockRequest, file, (err: any, info: any) => {
        expect(err).toBeNull();
        expect(path.dirname(info.path)).toBe(config.uploads.profilePictures.path);
        fs.unlink(info.path).then(() => done());
      });
    });

    it('should generate unique filenames', (done) => {
      const diskStorage = multer.diskStorage({
        destination: (upload as any).storage.getDestination,
        filename: (upload as any).storage.getFilename,
      });

      const fileBuffer = Buffer.from('test image content');
      const file = createMockFile('test.jpg', 'image/jpeg', fileBuffer);

      // Get two filenames in sequence
      diskStorage._handleFile(mockRequest, file, (err1: any, info1: any) => {
        expect(err1).toBeNull();
        const filename1 = path.basename(info1.path);
        expect(filename1).toMatch(/^\d+-\d+-test\.jpg$/);

        const file2 = createMockFile('test.jpg', 'image/jpeg', fileBuffer);
        diskStorage._handleFile(mockRequest, file2, (err2: any, info2: any) => {
          expect(err2).toBeNull();
          const filename2 = path.basename(info2.path);
          expect(filename2).toMatch(/^\d+-\d+-test\.jpg$/);
          expect(filename1).not.toBe(filename2);

          // Clean up test files
          Promise.all([fs.unlink(info1.path), fs.unlink(info2.path)]).then(() => done());
        });
      });
    });
  });

  describe('file size limits', () => {
    it('should have correct file size limit', () => {
      expect((upload as any).limits.fileSize).toBe(5 * 1024 * 1024); // 5MB
    });
  });

  describe('upload directory', () => {
    it('should create upload directory if it does not exist', async () => {
      // Delete the directory if it exists
      await fs.rm(config.uploads.profilePictures.path, { recursive: true, force: true });

      // Import the module again to trigger directory creation
      jest.isolateModules(async () => {
        require('../FileUploadMiddleware');

        // Wait for directory creation with retries
        let retries = 5;
        let stats;
        while (retries > 0) {
          try {
            stats = await fs.stat(config.uploads.profilePictures.path);
            break;
          } catch (error) {
            retries--;
            if (retries === 0) throw error;
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        expect(stats!.isDirectory()).toBe(true);
      });
    });
  });
});
