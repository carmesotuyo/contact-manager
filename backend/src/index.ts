import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createAuthRouter } from './interfaces/http/routes/auth.routes';
import { createContactRouter } from './interfaces/http/routes/contact.routes';
import { createNoteRouter } from './interfaces/http/routes/note.routes';
import { AuthMiddleware } from './interfaces/middleware/AuthMiddleware';
import { AuthenticationService } from './application/services/AuthenticationService';
import { ContactService } from './application/services/ContactService';
import { NoteService } from './application/services/NoteService';
import { PrismaUserRepository } from './infrastructure/persistence/prisma/repositories/UserRepository';
import { PrismaContactRepository } from './infrastructure/persistence/prisma/repositories/ContactRepository';
import { PrismaNoteRepository } from './infrastructure/persistence/prisma/repositories/NoteRepository';
import { BcryptPasswordService } from './infrastructure/auth/services/BcryptPasswordService';
import { JwtTokenService } from './infrastructure/auth/services/JwtTokenService';
import config from './infrastructure/config';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const userRepository = new PrismaUserRepository();
const contactRepository = new PrismaContactRepository();
const noteRepository = new PrismaNoteRepository();

const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService(process.env.JWT_SECRET || 'your-secret-key');
const authService = new AuthenticationService(userRepository, passwordService, tokenService);
const contactService = new ContactService(contactRepository);
const noteService = new NoteService(noteRepository, contactRepository);

const authMiddleware = new AuthMiddleware(authService);

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use(config.uploads.profilePictures.url, express.static(config.uploads.profilePictures.path));

// Routes
const authRouter = createAuthRouter(authService);
const contactRouter = createContactRouter(contactService, noteService, authMiddleware);
const noteRouter = createNoteRouter(noteService, authMiddleware);

app.use('/api', authRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/notes', noteRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
