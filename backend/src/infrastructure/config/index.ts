import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  databaseUrl: string;
  googlePlacesApiKey: string;
  uploads: {
    profilePictures: {
      path: string; // Physical path where files are stored
      url: string; // URL path where files are served
    };
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  databaseUrl: process.env.DATABASE_URL || '',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  uploads: {
    profilePictures: {
      path: path.join(
        process.env.UPLOAD_DIR || path.resolve(__dirname, '../../../uploads'),
        'profile-pictures',
      ),
      url: '/uploads/profile-pictures',
    },
  },
};

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default config;
