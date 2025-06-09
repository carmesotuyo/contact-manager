import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createAuthRouter } from './interfaces/http/routes/auth.routes';
import { AuthenticationService } from './application/services/AuthenticationService';
import { PrismaUserRepository } from './infrastructure/persistence/prisma/repositories/UserRepository';
import { BcryptPasswordService } from './infrastructure/auth/services/BcryptPasswordService';
import { JwtTokenService } from './infrastructure/auth/services/JwtTokenService';

dotenv.config();

const app = express();

// Initialize dependencies
const userRepository = new PrismaUserRepository();
const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService(process.env.JWT_SECRET || 'your-secret-key');
const authService = new AuthenticationService(userRepository, passwordService, tokenService);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
});

app.use('/api', createAuthRouter(authService));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
