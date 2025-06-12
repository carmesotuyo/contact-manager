import { Router } from 'express';
import { NoteController } from '../controllers/NoteController';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { INoteService } from '../../../application/ports/INoteService';

export const createNoteRouter = (
  noteService: INoteService,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();
  const noteController = new NoteController(noteService);

  router.use(authMiddleware.authenticate.bind(authMiddleware));

  router.post('/', noteController.createNote.bind(noteController));
  router.put('/:noteId', noteController.updateNote.bind(noteController));
  router.delete('/:noteId', noteController.deleteNote.bind(noteController));
  router.get('/', noteController.getNotesByUser.bind(noteController));

  return router;
};
