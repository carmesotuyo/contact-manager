import multer from 'multer';
import config from '../../infrastructure/config';
import fs from 'fs/promises';

// Ensure upload directory exists
const ensureUploadDir = async () => {
  await fs.mkdir(config.uploads.profilePictures.path, { recursive: true });
};

ensureUploadDir().catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploads.profilePictures.path);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
