import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createAuthRouter } from './interfaces/http/routes/auth.routes';
import { createContactRouter } from './interfaces/http/routes/contact.routes';
import { AuthMiddleware } from './interfaces/middleware/AuthMiddleware';
import { AuthenticationService } from './application/services/AuthenticationService';
import { ContactService } from './application/services/ContactService';
import { PrismaUserRepository } from './infrastructure/persistence/prisma/repositories/UserRepository';
import { PrismaContactRepository } from './infrastructure/persistence/prisma/repositories/ContactRepository';
import { BcryptPasswordService } from './infrastructure/auth/services/BcryptPasswordService';
import { JwtTokenService } from './infrastructure/auth/services/JwtTokenService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const userRepository = new PrismaUserRepository();
const contactRepository = new PrismaContactRepository();

const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService(process.env.JWT_SECRET || 'your-secret-key');
const authService = new AuthenticationService(userRepository, passwordService, tokenService);
const contactService = new ContactService(contactRepository);

const authMiddleware = new AuthMiddleware(authService);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRouter = createAuthRouter(authService);
const contactRouter = createContactRouter(contactService, authMiddleware);

app.use('/api', authRouter);
app.use('/api/contacts', contactRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
