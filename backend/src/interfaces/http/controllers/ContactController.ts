import { Request, Response } from 'express';
import { IContactService } from '../../../application/ports/IContactService';
import { ContactSearchDTO } from '../../../application/dtos/contacts.dto';

export class ContactController {
  constructor(private readonly contactService: IContactService) {}

  async createContact(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const userId = req.user.id;
      const result = await this.contactService.createContact({
        ...req.body,
        userId,
      });

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getContacts(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const userId = req.user.id;
      const searchCriteria: ContactSearchDTO = {
        userId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        query: req.query.query as string,
      };

      const result = await this.contactService.getContactsByUser(userId, searchCriteria);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getContact(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const userId = req.user.id;
      const contactId = req.params.contactId;

      try {
        const contact = await this.contactService.getContactByIdAndValidateUser(contactId, userId);
        res.json(contact);
      } catch (error) {
        if (error instanceof Error && error.message === 'Contact not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        throw error;
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateContact(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const userId = req.user.id;
      const contactId = req.params.contactId;

      const result = await this.contactService.updateContact(contactId, userId, req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Contact not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteContact(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'User not found' });
        return;
      }

      const userId = req.user.id;
      const contactId = req.params.contactId;

      await this.contactService.deleteContact(contactId, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Contact not found') {
          res.status(404).json({ message: error.message });
          return;
        }
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
