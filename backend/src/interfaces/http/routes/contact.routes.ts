import { Router } from 'express';
import { ContactController } from '../controllers/ContactController';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { IContactService } from '../../../application/ports/IContactService';
import { INoteService } from '../../../application/ports/INoteService';
import { upload } from '../../middleware/FileUploadMiddleware';

export function createContactRouter(
  contactService: IContactService,
  noteService: INoteService,
  authMiddleware: AuthMiddleware,
): Router {
  const router = Router();
  const contactController = new ContactController(contactService, noteService);

  router.use(authMiddleware.authenticate.bind(authMiddleware));

  router.post('/', upload.single('profilePicture'), (req, res) =>
    contactController.createContact(req, res),
  );
  router.get('/', (req, res) => contactController.getContacts(req, res));
  router.get('/:contactId', (req, res) => contactController.getContact(req, res));
  router.put('/:contactId', upload.single('profilePicture'), (req, res) =>
    contactController.updateContact(req, res),
  );
  router.delete('/:contactId', (req, res) => contactController.deleteContact(req, res));
  router.get('/:contactId/notes', (req, res) => contactController.getNotesByContact(req, res));

  return router;
}
