import { Router } from 'express';
import { ContactController } from '../controllers/ContactController';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';
import { IContactService } from '../../../application/ports/IContactService';

export function createContactRouter(
  contactService: IContactService,
  authMiddleware: AuthMiddleware,
): Router {
  const router = Router();
  const contactController = new ContactController(contactService);

  router.use(authMiddleware.authenticate.bind(authMiddleware));

  router.post('/', (req, res) => contactController.createContact(req, res));
  router.get('/', (req, res) => contactController.getContacts(req, res));
  router.get('/:contactId', (req, res) => contactController.getContact(req, res));
  router.put('/:contactId', (req, res) => contactController.updateContact(req, res));
  router.delete('/:contactId', (req, res) => contactController.deleteContact(req, res));

  return router;
}
